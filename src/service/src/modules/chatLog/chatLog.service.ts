import { ChatType } from '@/common/constants/balance.constant';
import { formatDate, maskEmail } from '@/common/utils';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import excel from 'exceljs';
import { Request, Response } from 'express';
import { In, Like, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { ChatGroupEntity } from '../chatGroup/chatGroup.entity';
import { UserEntity } from '../user/user.entity';
import { ChatLogEntity } from './chatLog.entity';
import { ChatListDto } from './dto/chatList.dto';
import { DelDto } from './dto/del.dto';
import { DelByGroupDto } from './dto/delByGroup.dto';
import { ExportExcelChatlogDto } from './dto/exportExcelChatlog.dto';
import { QuerAllChatLogDto } from './dto/queryAllChatLog.dto';
import { QuerAllDrawLogDto } from './dto/queryAllDrawLog.dto';
import { QueryByAppIdDto } from './dto/queryByAppId.dto';
import { QuerMyChatLogDto } from './dto/queryMyChatLog.dto';
import { recDrawImgDto } from './dto/recDrawImg.dto';
// import { ModelsTypeEntity } from '../models/modelType.entity';
import { JwtPayload } from 'src/types/express';
import { ModelsService } from '../models/models.service';

@Injectable()
export class ChatLogService {
  constructor(
    @InjectRepository(ChatLogEntity)
    private readonly chatLogEntity: Repository<ChatLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(ChatGroupEntity)
    private readonly chatGroupEntity: Repository<ChatGroupEntity>,
    private readonly modelsService: ModelsService
  ) {}

  /* 記錄問答日誌 */
  async saveChatLog(logInfo): Promise<any> {
    const savedLog = await this.chatLogEntity.save(logInfo);
    return savedLog; // 這裡返回保存後的實體，包括其 ID
  }

  /* 更新問答日誌 */
  async updateChatLog(id, logInfo) {
    return await this.chatLogEntity.update({ id }, logInfo);
  }

  async findOneChatLog(id) {
    return await this.chatLogEntity.findOne({ where: { id } });
  }

  /* 查詢我的繪製記錄 */
  async querDrawLog(req: Request, query: QuerMyChatLogDto) {
    const { id } = req.user;
    const { model } = query;
    const where: any = { userId: id, type: ChatType.PAINT };
    if (model) {
      where.model = model;
      if (model === 'DALL-E2') {
        where.model = In(['DALL-E2', 'dall-e-3']);
      }
    }
    const data = await this.chatLogEntity.find({
      where,
      order: { id: 'DESC' },
      select: ['id', 'answer', 'prompt', 'model', 'type', 'fileInfo'],
    });
    data.forEach((r: any) => {
      if (r.type === 'paintCount') {
        const w = r.model === 'mj' ? 310 : 160;
        const imgType = r.answer.includes('cos') ? 'tencent' : 'ali';
        const compress =
          imgType === 'tencent'
            ? `?imageView2/1/w/${w}/q/55`
            : `?x-oss-process=image/resize,w_${w}`;
        r.thumbImg = r.answer + compress;
        try {
          r.fileInfo = r.fileInfo ? JSON.parse(r.fileInfo) : null;
        } catch (error) {
          r.fileInfo = {};
        }
      }
    });
    return data;
  }

  /* 查詢所有繪製記錄 */
  async querAllDrawLog(params: QuerAllDrawLogDto) {
    const { page = 1, size = 20, rec, userId, model } = params;
    const where: any = {
      type: 2,
      prompt: Not(''),
      answer: Not(''),
      fileInfo: Not(''),
    };
    rec && Object.assign(where, { rec });
    userId && Object.assign(where, { userId });
    if (model) {
      where.model = model;
    } else {
      where.model = In(['midjourney', 'dall-e-3', 'stable-diffusion']);
    }
    const [rows, count] = await this.chatLogEntity.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
      where,
    });

    const userIds = rows
      .map((item: any) => item.userId)
      .filter((id) => id < 100000);
    const userInfos = await this.userEntity.find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'avatar', 'email'],
    });
    rows.forEach((item: any) => {
      item.userInfo = userInfos.find((user) => user.id === item.userId);
    });

    rows.forEach((r: any) => {
      const w = r.model === 'midjourney' ? 310 : 160; // mj壓縮到310  dall-e壓縮到160 寬度
      /* 需要區分圖片是阿里雲oss還是騰訊雲cos  壓縮方式不同  */
      const imgType = r.answer.includes('cos') ? 'tencent' : 'ali';
      const compress =
        imgType === 'tencent'
          ? `?imageView2/1/w/${w}/q/55`
          : `?x-oss-process=image/resize,w_${w}`;
      r.thumbImg = r.answer + compress;
      try {
        const detailInfo = r.extend ? JSON.parse(r.extend) : null;
        if (detailInfo) {
          if (detailInfo) {
            r.isGroup = detailInfo?.components[0]?.components.length === 5;
          } else {
            r.isGroup = false;
          }
        }
      } catch (error) {
        console.log('querAllDrawLog Json parse error', error);
      }
    });

    return { rows, count };
  }

  // 查詢單條繪製記錄
  async findOneDrawLog(params: { id?: number; drawId?: number }) {
    // 構建查詢條件
    const { id } = params;
    // const where: any = {};
    // if (params.id) where.id = params.id;
    // if (params.drawId) where.drawId = params.drawId;
    // 查詢單條記錄
    const record = await this.chatLogEntity.findOne({ where: { id } });
    return record;
  }

  /* 推薦圖片到對外展示 */
  async recDrawImg(body: recDrawImgDto) {
    const { id } = body;
    const l = await this.chatLogEntity.findOne({
      where: { id, type: ChatType.PAINT },
    });
    if (!l) {
      throw new HttpException(
        '你推薦的圖片不存在、請檢查！',
        HttpStatus.BAD_REQUEST
      );
    }
    const rec = l.rec === 1 ? 0 : 1;
    const res = await this.chatLogEntity.update({ id }, { rec });
    if (res.affected > 0) {
      return `${rec ? '推薦' : '取消推薦'}圖片成功！`;
    }
    throw new HttpException(
      '你操作的圖片不存在、請檢查！',
      HttpStatus.BAD_REQUEST
    );
  }

  /* 導出為excel對話記錄 */
  async exportExcel(body: ExportExcelChatlogDto, res: Response) {
    const where = { type: ChatType.NORMAL_CHAT };
    const { page = 1, size = 30, prompt, email } = body;
    prompt && Object.assign(where, { prompt: Like(`%${prompt}%`) });
    if (email) {
      const user = await this.userEntity.findOne({ where: { email } });
      user?.id && Object.assign(where, { userId: user.id });
    }
    const [rows, count] = await this.chatLogEntity.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
      where,
    });

    const userIds = rows.map((r) => r.userId);
    const userInfos = await this.userEntity.find({
      where: { id: In(userIds) },
    });
    const data = rows.map((r) => {
      const userInfo = userInfos.find((u) => u.id === r.userId);
      return {
        username: userInfo ? userInfo.username : '',
        email: userInfo ? userInfo.email : '',
        prompt: r.prompt,
        answer: r.answer,
        createdAt: formatDate(r.createdAt),
      };
    });

    const workbook = new excel.Workbook();

    const worksheet = workbook.addWorksheet('chatlog');

    worksheet.columns = [
      { header: '用戶名', key: 'username', width: 20 },
      { header: '用戶郵箱', key: 'email', width: 20 },
      { header: '提問時間', key: 'createdAt', width: 20 },
      { header: '提問問題', key: 'prompt', width: 80 },
      { header: '回答答案', key: 'answer', width: 150 },
    ];

    data.forEach((row) => worksheet.addRow(row));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'chat.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  /* 查詢所有對話記錄 */
  async querAllChatLog(params: QuerAllChatLogDto, req: Request) {
    const { page = 1, size = 20, userId, prompt } = params;
    const where = { type: ChatType.NORMAL_CHAT, prompt: Not('') };
    userId && Object.assign(where, { userId });
    prompt && Object.assign(where, { prompt: Like(`%${prompt}%`) });
    const [rows, count] = await this.chatLogEntity.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
      where,
    });
    const userIds = rows.map((item) => item.userId);
    const userInfo = await this.userEntity.find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'email'],
    });
    rows.forEach((item: any) => {
      const { username, email } =
        userInfo.find((u) => u.id === item.userId) || {};
      item.username = username;
      item.email = email;
    });
    req.user.role !== 'super' &&
      rows.forEach((t: any) => (t.email = maskEmail(t.email)));
    rows.forEach((item: any) => {
      !item.email && (item.email = `${item?.userId}@aiweb.com`);
      !item.username && (item.username = `遊客${item?.userId}`);
    });
    return { rows, count };
  }

  /* 查詢當前對話的列表 */
  async chatList(req: Request, params: ChatListDto) {
    const { id } = req.user;
    const { groupId } = params;
    const where = { userId: id, isDelete: false };
    groupId && Object.assign(where, { groupId });
    if (groupId) {
      const count = await this.chatGroupEntity.count({
        where: { isDelete: false },
      });
      if (count === 0) return [];
    }
    const list = await this.chatLogEntity.find({ where });
    return list.map((item) => {
      const {
        prompt,
        role,
        answer,
        createdAt,
        model,
        modelName,
        type,
        status,
        action,
        drawId,
        id,
        fileInfo,
        ttsUrl,
        videoUrl,
        audioUrl,
        customId,
        pluginParam,
        modelAvatar,
        taskData,
        promptReference,
      } = item;
      return {
        chatId: id,
        dateTime: formatDate(createdAt),
        text: role === 'user' ? prompt : answer,
        modelType: type,
        status: status,
        action: action,
        drawId: drawId,
        customId: customId,
        inversion: role === 'user',
        error: false,
        fileInfo: fileInfo,
        ttsUrl: ttsUrl,
        videoUrl: videoUrl,
        audioUrl: audioUrl,
        model: model,
        modelName: modelName,
        pluginParam: pluginParam,
        modelAvatar: modelAvatar,
        taskData: taskData,
        promptReference: promptReference,
      };
    });
  }

  /* 查詢歷史對話的列表 */
  async chatHistory(groupId: number, rounds: number) {
    // Logger.debug(`查詢歷史對話的列表, groupId: ${groupId}, rounds: ${rounds}`);

    if (rounds === 0) {
      // Logger.debug('輪次為0，返回空數組');
      return [];
    }

    const where = { isDelete: false, groupId: groupId };
    // Logger.debug('查詢條件:', JSON.stringify(where, null, 2));

    const list = await this.chatLogEntity.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      take: rounds * 2, // 只取最新的rounds條記錄
    });

    // Logger.debug('查詢結果:', JSON.stringify(list, null, 2));

    const result = list
      .map((item) => {
        const { role, prompt, answer, fileInfo } = item;
        const record = {
          role: role,
          text: role === 'user' ? prompt : answer,
          fileInfo: fileInfo,
        };
        // Logger.debug('處理記錄:', JSON.stringify(record, null, 2));
        return record;
      })
      .reverse(); // 添加.reverse()來反轉數組，使結果按時間從舊到新排列

    // Logger.debug('處理後的結果:', JSON.stringify(result, null, 2));

    return result;
  }

  /* 刪除單條對話記錄 */
  async deleteChatLog(req: Request, body: DelDto) {
    const { id: userId } = req.user;
    const { id } = body;
    const c = await this.chatLogEntity.findOne({ where: { id, userId } });
    if (!c) {
      throw new HttpException(
        '你刪除的對話記錄不存在、請檢查！',
        HttpStatus.BAD_REQUEST
      );
    }
    const r = await this.chatLogEntity.update({ id }, { isDelete: true });
    if (r.affected > 0) {
      return '刪除對話記錄成功！';
    } else {
      throw new HttpException(
        '你刪除的對話記錄不存在、請檢查！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 清空一組對話記錄 */
  async delByGroupId(req: Request, body: DelByGroupDto) {
    const { groupId } = body;
    const { id } = req.user;
    const g = await this.chatGroupEntity.findOne({
      where: { id: groupId, userId: id },
    });

    if (!g) {
      throw new HttpException(
        '你刪除的對話記錄不存在、請檢查！',
        HttpStatus.BAD_REQUEST
      );
    }

    const r = await this.chatLogEntity.update({ groupId }, { isDelete: true });

    if (r.affected > 0) {
      return '刪除對話記錄成功！';
    }

    if (r.affected === 0) {
      throw new HttpException(
        '當前頁面已經沒有東西可以刪除了！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 刪除對話組中某條對話及其後的所有對話 */
  async deleteChatsAfterId(req: Request, body: any) {
    const { id } = body; // 從請求體中獲取對話記錄 id
    const { id: userId } = req.user; // 從請求中獲取用戶ID

    // 查找該對話記錄，確保其存在且屬於當前用戶
    const chatLog = await this.chatLogEntity.findOne({ where: { id, userId } });
    if (!chatLog) {
      // 如果對話記錄不存在，拋出異常
      throw new HttpException(
        '你刪除的對話記錄不存在、請檢查！',
        HttpStatus.BAD_REQUEST
      );
    }

    const { groupId } = chatLog; // 獲取該對話記錄所在的對話組ID

    // 刪除該對話組中所有 ID 大於等於當前 id 的對話記錄
    const result = await this.chatLogEntity.update(
      { groupId, id: MoreThanOrEqual(id) },
      { isDelete: true }
    );

    if (result.affected > 0) {
      // 如果更新成功，返回成功消息
      return '刪除對話記錄成功！';
    } else {
      // 如果沒有任何記錄被更新，拋出異常
      throw new HttpException(
        '當前頁面已經沒有東西可以刪除了！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 查詢單個應用的使用記錄 */
  async byAppId(req: Request, body: QueryByAppIdDto) {
    const { id } = req.user;
    const { appId, page = 1, size = 10 } = body;
    const [rows, count] = await this.chatLogEntity.findAndCount({
      where: { userId: id, appId, role: 'assistant' },
      order: { id: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });
    return { rows, count };
  }

  async checkModelLimits(userId: JwtPayload, model: string) {
    const ONE_HOUR_IN_MS = 3600 * 1000;
    const oneHourAgo = new Date(Date.now() - ONE_HOUR_IN_MS);

    try {
      // 計算一小時內模型的使用次數
      const usageCount = await this.chatLogEntity.count({
        where: {
          userId: userId.id,
          model,
          createdAt: MoreThan(oneHourAgo),
        },
      });

      const adjustedUsageCount = Math.ceil(usageCount / 2);

      Logger.log(
        `用戶ID: ${userId.id} 一小時內調用 ${model} 模型 ${
          adjustedUsageCount + 1
        } 次`,
        'ChatLogService'
      );

      // 獲取模型的使用限制

      let modelInfo;
      if (model.startsWith('gpt-4-gizmo')) {
        modelInfo = await this.modelsService.getCurrentModelKeyInfo('gpts');
      } else {
        modelInfo = await this.modelsService.getCurrentModelKeyInfo(model);
      }
      const modelLimits = Number(modelInfo.modelLimits);

      Logger.log(
        `模型 ${model} 的使用次數限制為 ${modelLimits}`,
        'ChatLogService'
      );

      // 檢查是否超過使用限制
      if (adjustedUsageCount > modelLimits) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(
        `查詢數據庫出錯 - 用戶ID: ${userId.id}, 模型: ${model}, 錯誤資訊: ${error.message}`,
        error.stack,
        'ChatLogService'
      );
    }
  }
}
