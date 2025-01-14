import { hideString } from '@/common/utils';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Like, Repository } from 'typeorm';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UserEntity } from '../user/user.entity';
import { BadWordsEntity } from './badWords.entity';
import { AddBadWordDto } from './dto/addBadWords.dto';
import { DelBadWordsDto } from './dto/delBadWords.dto';
import { QueryBadWordsDto } from './dto/queryBadWords.dto';
import { UpdateBadWordsDto } from './dto/updateBadWords.dto';
import { ViolationLogEntity } from './violationLog.entity';

@Injectable()
export class BadWordsService implements OnModuleInit {
  private badWords: string[];
  constructor(
    @InjectRepository(BadWordsEntity)
    private readonly badWordsEntity: Repository<BadWordsEntity>,
    @InjectRepository(ViolationLogEntity)
    private readonly violationLogEntity: Repository<ViolationLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    private readonly globalConfigService: GlobalConfigService
  ) {
    this.badWords = [];
  }

  async onModuleInit() {
    this.loadBadWords();
  }

  /* 敏感詞匹配 */
  // async customSensitiveWords(content, userId) {
  //   const triggeredWords = [];
  //   for (let i = 0; i < this.badWords.length; i++) {
  //     const word = this.badWords[i];
  //     if (content.includes(word)) {
  //       triggeredWords.push(word);
  //     }
  //   }
  //   if (triggeredWords.length) {
  //     await this.recordUserBadWords(
  //       userId,
  //       content,
  //       triggeredWords,
  //       ['自定義'],
  //       '自定義檢測'
  //     );
  //     const tips = `您遞交的資訊中包含違規的內容、我們已對您的賬戶進行標記、請合規使用！`;
  //     throw new HttpException(tips, HttpStatus.BAD_REQUEST);
  //   }
  // }
  /* 敏感詞匹配 */
  async customSensitiveWords(content, userId) {
    const triggeredWords = [];

    // 遍歷敏感詞列表，查找內容中是否包含敏感詞
    for (let i = 0; i < this.badWords.length; i++) {
      const word = this.badWords[i];
      if (content.includes(word)) {
        triggeredWords.push(word); // 如果包含敏感詞，將其加入到數組中
      }
    }

    if (triggeredWords.length) {
      // 如果找到敏感詞，記錄用戶遞交的違規內容
      await this.recordUserBadWords(
        userId,
        content,
        triggeredWords,
        ['自定義'],
        '自定義檢測'
      );
    }

    // 返回檢測到的敏感詞列表（如果沒有敏感詞，返回空數組）
    return triggeredWords;
  }

  /* 敏感詞檢測 先檢測百度敏感詞 後檢測自定義的 */
  async checkBadWords(content: string, userId: number) {
    const config = await this.globalConfigService.getSensitiveConfig();
    /* 如果有則啟動配置檢測 沒有則跳過 */
    if (config) {
      await this.checkBadWordsByConfig(content, config, userId);
    }
    /* 自定義敏感詞檢測 */
    return await this.customSensitiveWords(content, userId);
  }

  /* 通過配置資訊去檢測敏感詞 */
  async checkBadWordsByConfig(content: string, config: any, userId) {
    const { useType } = config;
    useType === 'baidu' &&
      (await this.baiduCheckBadWords(
        content,
        config.baiduTextAccessToken,
        userId
      ));
  }

  /* 提取百度雲敏感詞違規類型 */
  extractContent(str) {
    const pattern = /存在(.*?)不合規/;
    const match = str.match(pattern);
    return match ? match[1] : '';
  }

  /* 通過百度雲敏感詞檢測 */
  async baiduCheckBadWords(
    content: string,
    accessToken: string,
    userId: number
  ) {
    if (!accessToken) return;
    const url = `https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=${accessToken}}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    const response = await axios.post(url, { text: content }, { headers });
    const { conclusion, error_code, error_msg, conclusionType, data } =
      response.data;
    if (error_code) {
      console.log('百度文本檢測出現錯誤、請查看配置資訊: ', error_msg);
    }
    // conclusion 審核結果，可取值：合規、不合規、疑似、審核失敗
    // conclusionType 1.合規，2.不合規，3.疑似，4.審核失敗
    if (conclusionType !== 1) {
      const types = [
        ...new Set(data.map((item) => this.extractContent(item.msg))),
      ];
      await this.recordUserBadWords(
        userId,
        content,
        ['***'],
        types,
        '百度雲檢測'
      );
      const tips = `您遞交的資訊中包含${types.join(
        ','
      )}的內容、我們已對您的賬戶進行標記、請合規使用！`;
      throw new HttpException(tips, HttpStatus.BAD_REQUEST);
    }
  }

  /* formarTips */
  formarTips(wordList) {
    const categorys = wordList.map((t) => t.category);
    const unSet = [...new Set(categorys)];
    return `您遞交的內容中包含${unSet.join(
      ','
    )}的資訊、我們已對您賬號進行標記、請合規使用！`;
  }

  /* 加載自定義的敏感詞 */
  async loadBadWords() {
    const data = await this.badWordsEntity.find({
      where: { status: 1 },
      select: ['word'],
    });
    this.badWords = data.map((t) => t.word);
  }

  /* 查詢自定義的敏感詞 */
  async queryBadWords(query: QueryBadWordsDto) {
    const { page = 1, size = 500, word, status } = query;
    const where: any = {};
    [0, 1, '0', '1'].includes(status) && (where.status = status);
    word && (where.word = Like(`%${word}%`));
    const [rows, count] = await this.badWordsEntity.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'ASC' },
    });
    return { rows, count };
  }

  /* 刪除自定義敏感詞 */
  async delBadWords(body: DelBadWordsDto) {
    const b = await this.badWordsEntity.findOne({ where: { id: body.id } });
    if (!b) {
      throw new HttpException(
        '敏感詞不存在,請檢查您的遞交資訊',
        HttpStatus.BAD_REQUEST
      );
    }
    const res = await this.badWordsEntity.delete({ id: body.id });
    if (res.affected > 0) {
      await this.loadBadWords();
      return '刪除敏感詞成功';
    } else {
      throw new HttpException('刪除敏感詞失敗', HttpStatus.BAD_REQUEST);
    }
  }

  /* 修改自定義敏感詞 */
  async updateBadWords(body: UpdateBadWordsDto) {
    const { id, word, status } = body;
    const b = await this.badWordsEntity.findOne({ where: { word } });
    if (b) {
      throw new HttpException(
        '敏感詞已經存在了、請勿重複添加',
        HttpStatus.BAD_REQUEST
      );
    }
    const res = await this.badWordsEntity.update({ id }, { word, status });
    if (res.affected > 0) {
      await this.loadBadWords();
      return '更新敏感詞成功';
    } else {
      throw new HttpException('更新敏感詞失敗', HttpStatus.BAD_REQUEST);
    }
  }

  async addBadWord(body: AddBadWordDto) {
    const { word } = body;
    const b = await this.badWordsEntity.findOne({ where: { word } });
    if (b) {
      throw new HttpException(
        '敏感詞已存在,請檢查您的遞交資訊',
        HttpStatus.BAD_REQUEST
      );
    }
    await this.badWordsEntity.save({ word });
    await this.loadBadWords();
    return '添加敏感詞成功';
  }

  /* 記錄用戶違規次數內容 */
  async recordUserBadWords(userId, content, words, typeCn, typeOriginCn) {
    const data = {
      userId,
      content,
      words: JSON.stringify(words),
      typeCn: JSON.stringify(typeCn),
      typeOriginCn,
    };
    try {
      await this.userEntity
        .createQueryBuilder()
        .update(UserEntity)
        .set({ violationCount: () => 'violationCount + 1' })
        .where('id = :userId', { userId })
        .execute();
      await this.violationLogEntity.save(data);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /* 違規記錄 */
  async violation(req, query) {
    const { role } = req.user;
    const { page = 1, size = 10, userId, typeOriginCn } = query;
    const where = {};
    userId && (where['userId'] = userId);
    typeOriginCn && (where['typeOriginCn'] = typeOriginCn);
    const [rows, count] = await this.violationLogEntity.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'DESC' },
    });
    const userIds = [...new Set(rows.map((t) => t.userId))];
    const usersInfo = await this.userEntity.find({
      where: { id: In(userIds) },
      select: ['id', 'avatar', 'username', 'email', 'violationCount', 'status'],
    });
    rows.forEach((t: any) => {
      // 查找用戶資訊，如果沒有找到，返回空對象
      const user: any = usersInfo.find((u) => u.id === t.userId) || {};

      // const user: any = usersInfo.find((u) => u.id === t.userId);
      role !== 'super' && (user.email = hideString(user.email));
      t.userInfo = user;
    });

    return { rows, count };
  }
}
