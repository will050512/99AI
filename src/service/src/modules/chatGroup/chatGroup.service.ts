import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Request } from 'express';
import * as pdf from 'pdf-parse';
import { In, Repository } from 'typeorm';
import { AppEntity } from '../app/app.entity';
import { ModelsService } from '../models/models.service';
import { ChatGroupEntity } from './chatGroup.entity';
import { CreateGroupDto } from './dto/createGroup.dto';
import { DelGroupDto } from './dto/delGroup.dto';
import { UpdateGroupDto } from './dto/updateGroup.dto';

@Injectable()
export class ChatGroupService {
  constructor(
    @InjectRepository(ChatGroupEntity)
    private readonly chatGroupEntity: Repository<ChatGroupEntity>,
    @InjectRepository(AppEntity)
    private readonly appEntity: Repository<AppEntity>,
    private readonly modelsService: ModelsService
  ) {}

  // async create(body: CreateGroupDto, req: Request) {
  //   const { id } = req.user;
  //   const { appId, modelConfig: bodyModelConfig } = body;

  //   // 嘗試使用從請求體中提供的 modelConfig，否則獲取默認配置
  //   let modelConfig = bodyModelConfig;
  //   if (!modelConfig) {
  //     modelConfig = await this.modelsService.getBaseConfig(appId);
  //     if (!modelConfig) {
  //       throw new HttpException('管理員未配置任何AI模型、請先聯繫管理員開通聊天模型配置！', HttpStatus.BAD_REQUEST);
  //     }
  //   }

  //   // 初始化創建對話組的參數
  //   const params = { title: '新對話', userId: id };
  //   if (appId) {
  //     // 查找應用資訊
  //     const appInfo = await this.appEntity.findOne({ where: { id: appId } });
  //     if (!appInfo) {
  //       throw new HttpException('非法操作、您在使用一個不存在的應用！', HttpStatus.BAD_REQUEST);
  //     }
  //     console.log('開始提取應用資訊並進行驗證');

  //     // 提取應用資訊並進行必要的驗證
  //     const { status, name, isFixedModel, isGPTs, appModel } = appInfo;
  //     modelConfig.modelInfo.isGPTs = isGPTs;
  //     modelConfig.modelInfo.isFixedModel = isFixedModel;
  //     modelConfig.modelInfo.modelName = name;
  //     if (isGPTs === 1 || isFixedModel === 1) {
  //       const appModelKey = await this.modelsService.getCurrentModelKeyInfo(isFixedModel === 1 ? appModel : 'gpts');
  //       modelConfig.modelInfo.deductType = appModelKey.deductType
  //       modelConfig.modelInfo.deduct = appModelKey.deduct
  //       modelConfig.modelInfo.model = appModel;
  //       modelConfig.modelInfo.isFileUpload = appModelKey.isFileUpload
  //     }

  //     // const existingGroupCount = await this.chatGroupEntity.count({ where: { userId: id, appId, isDelete: false } });
  //     // if (existingGroupCount > 0) {
  //     //   throw new HttpException('當前應用已經開啟了一個對話無需新建了！', HttpStatus.BAD_REQUEST);
  //     // }
  //     if (![1, 3, 4, 5].includes(status)) {
  //       throw new HttpException('非法操作、您在使用一個未啟用的應用！', HttpStatus.BAD_REQUEST);
  //     }

  //     // 如果有名稱，則設置對話組標題
  //     if (name) {
  //       params['title'] = name;
  //     }
  //     params['appId'] = appId;
  //   }
  //   // 創建新的聊天組並保存
  //   console.log('最終的 modelConfig.modelInfo:', modelConfig);
  //   const newGroup = await this.chatGroupEntity.save({ ...params, config: JSON.stringify(modelConfig) });
  //   return newGroup;
  // }

  async create(body: CreateGroupDto, req: Request) {
    const { id } = req.user; // 從請求中獲取用戶ID
    const { appId, modelConfig: bodyModelConfig, params } = body; // 從請求體中提取appId和modelConfig

    // 嘗試使用從請求體中提供的 modelConfig，否則獲取默認配置
    let modelConfig =
      bodyModelConfig || (await this.modelsService.getBaseConfig());
    if (!modelConfig) {
      throw new HttpException(
        '管理員未配置任何AI模型、請先聯繫管理員開通聊天模型配置！',
        HttpStatus.BAD_REQUEST
      );
    }

    // 使用 JSON.parse(JSON.stringify(object)) 進行深拷貝以避免直接修改原對象
    modelConfig = JSON.parse(JSON.stringify(modelConfig));

    // 初始化創建對話組的參數
    const groupParams = { title: '新對話', userId: id, appId, params };
    // const params = { title: 'New chat', userId: id };

    // 如果指定了appId，查找並驗證應用資訊
    if (appId) {
      const appInfo = await this.appEntity.findOne({ where: { id: appId } });
      if (!appInfo) {
        throw new HttpException(
          '非法操作、您在使用一個不存在的應用！',
          HttpStatus.BAD_REQUEST
        );
      }

      // 應用存在，提取並驗證應用資訊
      const { status, name, isFixedModel, isGPTs, appModel, coverImg } =
        appInfo;

      // 更新 modelConfig 以反映應用的特定配置
      Object.assign(modelConfig.modelInfo, {
        isGPTs,
        isFixedModel,
        modelAvatar: coverImg,
        modelName: name,
      });

      // 如果是固定模型或GPTs模型，獲取並設置額外的模型資訊
      if (isGPTs === 1 || isFixedModel === 1) {
        const appModelKey = await this.modelsService.getCurrentModelKeyInfo(
          isFixedModel === 1 ? appModel : 'gpts'
        );
        Object.assign(modelConfig.modelInfo, {
          deductType: appModelKey.deductType,
          deduct: appModelKey.deduct,
          model: appModel,
          isFileUpload: appModelKey.isFileUpload,
        });
      }

      // 檢查應用狀態是否允許創建對話組
      if (![1, 3, 4, 5].includes(status)) {
        throw new HttpException(
          '非法操作、您在使用一個未啟用的應用！',
          HttpStatus.BAD_REQUEST
        );
      }

      // 如果應用有名稱，則使用它作為對話組標題
      if (name) {
        groupParams.title = name;
      }
    }

    // 創建新的聊天組並保存
    const newGroup = await this.chatGroupEntity.save({
      ...groupParams,
      config: JSON.stringify(modelConfig), // 將 modelConfig 對象轉換為 JSON 字串進行保存
    });

    return newGroup; // 返回新創建的聊天組
  }

  async query(req: Request) {
    try {
      const { id } = req.user;
      const params = { userId: id, isDelete: false };
      const res = await this.chatGroupEntity.find({
        where: params,
        order: { isSticky: 'DESC', updatedAt: 'DESC' },
      });
      return res;
      // const res = await this.chatGroupEntity.find({ where: params, order: { isSticky: 'DESC', id: 'DESC' } });
      const appIds = res.filter((t) => t.appId).map((t) => t.appId);
      const appInfos = await this.appEntity.find({ where: { id: In(appIds) } });
      return res.map((item: any) => {
        item.appLogo = appInfos.find((t) => t.id === item.appId)?.coverImg;
        return item;
      });
    } catch (error) {
      console.log('error: ', error);
    }
  }

  async update(body: UpdateGroupDto, req: Request) {
    const { title, isSticky, groupId, config, fileUrl } = body;
    const { id } = req.user;
    const g = await this.chatGroupEntity.findOne({
      where: { id: groupId, userId: id },
    });
    if (!g) {
      throw new HttpException(
        '請先選擇一個對話或者新加一個對話再操作！',
        HttpStatus.BAD_REQUEST
      );
    }
    const { appId } = g;
    if (appId && !title) {
      try {
        const parseData = JSON.parse(config);
        if (Number(parseData.keyType) !== 1) {
          throw new HttpException(
            '應用對話名稱不能修改喲！',
            HttpStatus.BAD_REQUEST
          );
        }
      } catch (error) {
        // ignore
      }
    }
    const data = {};
    title && (data['title'] = title);
    typeof isSticky !== 'undefined' && (data['isSticky'] = isSticky);
    config && (data['config'] = config);
    fileUrl && (data['fileUrl'] = fileUrl);
    const u = await this.chatGroupEntity.update({ id: groupId }, data);
    if (u.affected) {
      // 如果 fileUrl 不為空，異步處理 PDF 內容讀取
      if (fileUrl) {
        this.handlePdfExtraction(fileUrl, groupId);
      }
      return true;
    } else {
      throw new HttpException('更新對話失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  // 異步處理 PDF 內容讀取
  private async handlePdfExtraction(fileUrl: string, groupId: number) {
    try {
      const pdfText = await this.extractPdfText(fileUrl);
      await this.chatGroupEntity.update(
        { id: groupId },
        { pdfTextContent: pdfText }
      );
    } catch (error) {
      // 處理錯誤情況，例如記錄日誌
      console.error('PDF 讀取失敗:', error);
    }
  }

  // 從 PDF 文件 URL 中提取文本內容
  private async extractPdfText(fileUrl: string): Promise<string> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });
      const dataBuffer = Buffer.from(response.data);
      const pdfData = await pdf(dataBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('PDF 解析失敗:', error);
      throw new Error('PDF 解析失敗');
    }
  }

  async updateTime(groupId: number) {
    await this.chatGroupEntity.update(groupId, {
      updatedAt: new Date(),
    });
  }

  async del(body: DelGroupDto, req: Request) {
    const { groupId } = body;
    const { id } = req.user;
    const g = await this.chatGroupEntity.findOne({
      where: { id: groupId, userId: id },
    });
    if (!g) {
      throw new HttpException(
        '非法操作、您在刪除一個非法資源！',
        HttpStatus.BAD_REQUEST
      );
    }
    const r = await this.chatGroupEntity.update(
      { id: groupId },
      { isDelete: true }
    );
    if (r.affected) {
      return '刪除成功';
    } else {
      throw new HttpException('刪除失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 刪除非置頂開啟的所有對話記錄 */
  async delAll(req: Request) {
    const { id } = req.user;
    const r = await this.chatGroupEntity.update(
      { userId: id, isSticky: false, isDelete: false },
      { isDelete: true }
    );
    if (r.affected) {
      return '刪除成功';
    } else {
      throw new HttpException('刪除失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 通過groupId查詢當前對話組的詳細資訊 */
  async getGroupInfoFromId(id) {
    if (!id) return;
    const groupInfo = await this.chatGroupEntity.findOne({ where: { id } });
    if (groupInfo) {
      const { pdfTextContent, ...rest } = groupInfo;
      return rest;
    }
  }

  async getGroupPdfText(groupId: number) {
    const groupInfo = await this.chatGroupEntity.findOne({
      where: { id: groupId },
    });
    if (groupInfo) {
      return groupInfo.pdfTextContent;
    }
  }
}
