import { createRandomCode } from '@/common/utils';
import { GlobalConfigService } from '@/modules/globalConfig/globalConfig.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../redisCache/redisCache.service';
import { VerificationUseStatusEnum } from './../../common/constants/status.constant';
import { VerificationEnum } from './../../common/constants/verification.constant';
import { UserEntity } from './../user/user.entity';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { VerifycationEntity } from './verifycation.entity';

import * as Core from '@alicloud/pop-core';
import axios from 'axios';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerifycationEntity)
    private readonly verifycationEntity: Repository<VerifycationEntity>,
    private readonly globalConfigService: GlobalConfigService,
    private readonly redisCacheService: RedisCacheService
  ) {}

  // TODO Transaction failed and cannot be rolled back
  async createVerification(
    user: UserEntity,
    type: VerificationEnum,
    expir = 30 * 60
  ): Promise<VerifycationEntity> {
    const historyVerify = await this.verifycationEntity.findOne({
      where: { userId: user.id, type },
      order: { createdAt: 'DESC' },
    });
    // 限制一分鐘內不得重新發送
    if (
      historyVerify &&
      historyVerify.createdAt.getTime() + 1 * 60 * 1000 > Date.now()
    ) {
      const diffS = Math.ceil(
        (historyVerify.createdAt.getTime() + 1 * 60 * 1000 - Date.now()) / 1000
      );
      throw new HttpException(
        `${diffS}S內不得重新發送`,
        HttpStatus.BAD_REQUEST
      );
    }
    const code = createRandomCode();
    const expiresAt = new Date(Date.now() + expir * 1000);
    const { id, email } = user;
    const verifycation = { userId: id, type, code, expiresAt, email };
    return await this.verifycationEntity.save(verifycation);
  }

  async verifyCode(
    { code, id }: VerifyCodeDto,
    type: VerificationEnum
  ): Promise<VerifycationEntity> {
    const v: VerifycationEntity = await this.verifycationEntity.findOne({
      where: { id, type },
      order: { createdAt: 'DESC' },
    });
    if (!v) {
      throw new HttpException('驗證碼不存在', HttpStatus.BAD_REQUEST);
    }
    if (v.used === VerificationUseStatusEnum.USED) {
      throw new HttpException('當前驗證碼已被使用！', HttpStatus.BAD_REQUEST);
    } else {
      v.used = VerificationUseStatusEnum.USED;
      await this.verifycationEntity.update({ id }, v);
    }
    if (Number(v.code) !== Number(code)) {
      throw new HttpException('驗證碼錯誤', HttpStatus.BAD_REQUEST);
    }
    if (v.expiresAt < new Date()) {
      throw new HttpException('驗證碼已過期', HttpStatus.BAD_REQUEST);
    }
    return v;
  }

  async sendPhoneCode(messageInfo) {
    const { accessKeyId, accessKeySecret, SignName, TemplateCode } =
      await this.globalConfigService.getPhoneVerifyConfig();
    console.log('Received messageInfo:', messageInfo);
    const { phone, code } = messageInfo;
    if (!phone || !code) {
      throw new HttpException('確實必要參數錯誤！', HttpStatus.BAD_REQUEST);
    }
    const client = new Core({
      accessKeyId,
      accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
    });
    const params = {
      PhoneNumbers: phone,
      SignName,
      TemplateCode,
      TemplateParam: JSON.stringify({ code }),
    };
    const requestOption = { method: 'POST', formatParams: false };
    try {
      const response: any = await client.request(
        'SendSms',
        params,
        requestOption
      );
      if (response.Code === 'OK') {
        return true;
      } else {
        throw new HttpException(
          response.Message || '驗證碼發送失敗！',
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      throw new HttpException(
        error?.data?.Message || '驗證碼發送失敗！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async verifyIdentity(identityInfo) {
    const appCode = await this.globalConfigService.getConfigs(['appCode']);
    const { name, idCard } = identityInfo;
    if (!name || !idCard) {
      throw new HttpException('缺少必要參數！', HttpStatus.BAD_REQUEST);
    }
    Logger.debug(`Received identityInfo: ${name}, ${idCard}`);

    const apiUrl = 'https://eid.shumaidata.com/eid/check';

    const headers = {
      Authorization: `APPCODE ${appCode}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const params = new URLSearchParams({
      name: name,
      idcard: idCard,
    });

    try {
      const response = await axios.post(apiUrl, params, { headers });
      // 將響應轉換為字串
      const responseString = JSON.stringify(response.data);

      // 輸出日誌
      Logger.debug(`Received response: ${responseString}`);

      switch (response.data.result.res) {
        case '1':
          return true;
        case '2':
          Logger.log('驗證不一致', 'VerificationService');
        case '3':
          Logger.log('實名認證異常', 'VerificationService');
        default:
          Logger.log('未知的認證結果', 'VerificationService');
      }
      return false;
    } catch (error) {
      Logger.error(`Error: ${error.message}`, error.stack, 'Verification');
      return false;
    }
  }
}
