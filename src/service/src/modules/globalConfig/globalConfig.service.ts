import { formatUrl, hideString } from '@/common/utils';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Request } from 'express';
import * as fs from 'fs';
import { In, Repository } from 'typeorm';
import { ChatLogEntity } from './../chatLog/chatLog.entity';
import { ModelsService } from './../models/models.service';
import { ConfigEntity } from './config.entity';
import { QueryConfigDto } from './dto/queryConfig.dto';
import { SetConfigDto } from './dto/setConfig.dto';
const packageJsonContent = fs.readFileSync('package.json', 'utf-8');
const packageJson = JSON.parse(packageJsonContent);
const version = packageJson.version;
console.log(' current use version in ------>: ', version);

@Injectable()
export class GlobalConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>,
    @InjectRepository(ChatLogEntity)
    private readonly chatLogEntity: Repository<ChatLogEntity>,
    private readonly modelsService: ModelsService
  ) {}
  private globalConfigs: any = {};
  private wechatAccessToken: string;
  private wechatJsapiTicket: string;

  async onModuleInit() {
    await this.initGetAllConfig();
  }

  /* 對外提供給其他service  */
  async getConfigs(configKey: string[]) {
    if (configKey.length === 0) return;
    /* 微信token特殊處理 */
    if (configKey.includes('wechatAccessToken') && configKey.length === 1) {
      return this.wechatAccessToken;
    }
    if (configKey.includes('wechatJsapiTicket') && configKey.length === 1) {
      return this.wechatJsapiTicket;
    }
    if (configKey.length === 1) {
      return this.globalConfigs[configKey[0]];
    } else {
      const result = {};
      configKey.forEach((key) => (result[key] = this.globalConfigs[key]));
      return result;
    }
  }

  /* 初始化查詢所有config 不對外調用 */
  async initGetAllConfig() {
    const data = await this.configEntity.find();
    this.globalConfigs = data.reduce((prev, cur) => {
      prev[cur.configKey] = cur.configVal;
      return prev;
    }, {});
    this.initBaiduSensitive();
  }

  /* 初始化百度敏感詞 拿到百度的access_token isInit: 初始化報錯不檢測  管理端手動修改則提示 */
  async initBaiduSensitive(isInit = true) {
    const { baiduTextApiKey, baiduTextSecretKey } = await this.getConfigs([
      'baiduTextApiKey',
      'baiduTextSecretKey',
    ]);
    if (!baiduTextApiKey || !baiduTextSecretKey) {
      // Logger.error('百度敏感詞初始化失敗，如果需要敏感檢測、請前往後臺系統配置!', 'GlobalConfigService');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const url = `https://aip.baidubce.com/oauth/2.0/token?client_id=${baiduTextApiKey}&client_secret=${baiduTextSecretKey}&grant_type=client_credentials`;
    try {
      const response = await axios.post(url, { headers });
      this.globalConfigs.baiduTextAccessToken = response.data.access_token;
    } catch (error) {
      if (isInit) {
        // Logger.error('百度敏感詞配置檢測失敗，您的參數可能配置的不正確!', 'GlobalConfigService');
      } else {
        throw new HttpException(
          error.response.data.error_description,
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }

  /* 定時刷新 access_token */
  async getWechatAccessToken(isInit = false) {
    const { wechatOfficialAppId: appId, wechatOfficialAppSecret: secret } =
      await this.getConfigs(['wechatOfficialAppId', 'wechatOfficialAppSecret']);
    if (!appId || !secret) {
      return Logger.error(
        '還未配置微信的appId和secret、配置後才可進行微信掃碼登錄！！！',
        'OfficialService'
      );
    }
    this.wechatAccessToken = await this.fetchBaseAccessToken(
      appId,
      secret,
      isInit
    );
    this.wechatJsapiTicket = await this.fetchJsapiTicket(
      this.wechatAccessToken
    );
    Logger.log(
      `wechat refresh access_token  ==> ${this.wechatAccessToken}`,
      'OfficialService'
    );
  }

  /* 獲取微信access_token */
  async fetchBaseAccessToken(appId: string, secret: string, isInit = false) {
    if (process.env.ISDEV === 'TRUE') {
      this.wechatAccessToken = '';
      return;
    }
    const Url = formatUrl(
      process.env.weChatApiUrl || 'https://api.weixin.qq.com'
    );
    const {
      data: { errmsg, access_token },
    } = await axios.get(
      `${Url}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
    );
    if (errmsg) {
      if (isInit) {
        Logger.error(
          `獲取微信access_token失敗、錯誤資訊：${errmsg}`,
          'OfficialService'
        );
      } else {
        throw new HttpException(
          '請配置正確的秘鑰、當前秘鑰檢測不通過！',
          HttpStatus.BAD_REQUEST
        );
      }
      return '';
    }
    return access_token;
  }

  /* 獲取微信jsapi_ticket */
  async fetchJsapiTicket(accessToken: string) {
    if (process.env.ISDEV === 'TRUE') {
      this.wechatJsapiTicket = '';
      return;
    }
    const Url = formatUrl(
      process.env.weChatApiUrl || 'https://api.weixin.qq.com'
    );
    const res = await axios.get(
      `${Url}/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
    );
    return res?.data?.ticket;
  }

  /* 查詢所有配置資訊 */
  async queryAllConfig(req: Request) {
    const { role } = req.user;
    return this.globalConfigs;
  }

  /* 前端網站的所有查閱權限的配置資訊 */
  async queryFrontConfig(query, req) {
    /* 指定前端可以訪問範圍 */
    const allowKeys = [
      'registerSendStatus',
      'registerSendModel3Count',
      'registerSendModel4Count',
      'registerSendDrawMjCount',
      'firstRegisterSendStatus',
      'firstRegisterSendRank',
      'firstRregisterSendModel3Count',
      'firstRregisterSendModel4Count',
      'firstRregisterSendDrawMjCount',
      'clientHomePath',
      'clientLogoPath',
      'clientFavoIconPath',
      'drawingStyles',
      'isUseWxLogin',
      'siteName',
      'robotAvatar',
      'siteRobotName',
      'buyCramiAddress',
      'mindDefaultData',
      'baiduCode',
      'payEpayChannel',
      'payMpayChannel',
      'payEpayApiPayUrl',
      'payEpayStatus',
      'payHupiStatus',
      'payWechatStatus',
      'payMpayStatus',
      'payLtzfStatus',
      'isAutoOpenNotice',
      'isShowAppCatIcon',
      'salesBaseRatio',
      'salesSeniorRatio',
      'salesAllowDrawMoney',
      'companyName',
      'filingNumber',
      'emailLoginStatus',
      'phoneLoginStatus',
      'wechatRegisterStatus',
      'wechatSilentLoginStatus',
      'signInStatus',
      'signInModel3Count',
      'signInModel4Count',
      'signInMjDrawToken',
      'appMenuHeaderTips',
      'pluginFirst',
      'mjUseBaiduFy',
      'mjHideNotBlock',
      'mjHideWorkIn',
      'isVerifyEmail',
      'showWatermark',
      'isHideTts',
      'isHideDefaultPreset',
      'isHideModel3Point',
      'isHideModel4Point',
      'isHideDrawMjPoint',
      'isHidePlugin',
      'model3Name',
      'model4Name',
      'drawMjName',
      'isModelInherited',
      'noVerifyRegister',
      'noticeInfo',
      'homeHtml',
      'isAutoOpenAgreement',
      'agreementInfo',
      'agreementTitle',
    ];
    const data = await this.configEntity.find({
      where: { configKey: In(allowKeys) },
    });
    const { domain } = query;
    const domainDb = this.globalConfigs['domain'];
    if (domainDb !== domain) {
      this.createOrUpdate({
        configKey: `domain`,
        configVal: domain,
        status: 1,
      });
      await this.initGetAllConfig();
    }
    const publicConfig = data.reduce((prev, cur) => {
      prev[cur.configKey] = cur.configVal;
      return prev;
    }, {});
    /* 追加一些自定義的配置 */
    const { wechatOfficialAppId, wechatOfficialAppSecret } =
      await this.getConfigs(['wechatOfficialAppId', 'wechatOfficialAppSecret']);
    const isUseWxLogin = !!(wechatOfficialAppId && wechatOfficialAppSecret);

    /* 查看是否有本機未同步數據 */
    return { ...publicConfig, isUseWxLogin };
  }

  /* 查詢配置 */
  async queryConfig(body: QueryConfigDto, req: Request) {
    const { role } = req.user;
    const { keys } = body;
    const data = await this.configEntity.find({
      where: { configKey: In(keys) },
    });
    /* 對演示賬戶的一些敏感配置修改處理 */
    if (role !== 'super') {
      // data = data.filter((t) => !t.configKey.includes('Key'));
      data.forEach((item) => {
        if (
          item.configKey.includes('mj') ||
          item.configKey.includes('Key') ||
          item.configKey.includes('gpt') ||
          item.configKey.includes('cos') ||
          item.configKey.includes('baidu') ||
          item.configKey.includes('ali') ||
          item.configKey.includes('tencent') ||
          item.configKey.includes('pay') ||
          item.configKey.includes('wechat') ||
          item.configKey.includes('mjProxyImgUrl') ||
          item.configKey === 'openaiBaseUrl'
        ) {
          /* 比較長的隱藏內容自定義 */
          const longKeys = ['payWeChatPublicKey', 'payWeChatPrivateKey'];
          if (longKeys.includes(item.configKey)) {
            return (item.configVal = hideString(
              item.configVal,
              '隱私內容、非超級管理員無權查看'
            ));
          }
          const whiteListKey = [
            'payEpayStatus',
            'payHupiStatus',
            'mjProxy',
            'payLtzfStatus',
          ];
          if (
            !whiteListKey.includes(item.configKey) &&
            !item.configKey.includes('Status')
          ) {
            item.configVal = hideString(item.configVal);
          }
        }
      });
    }

    return data.reduce((prev, cur) => {
      prev[cur.configKey] = cur.configVal;
      return prev;
    }, {});
  }

  /* 設置配置資訊 */
  async setConfig(body: SetConfigDto) {
    try {
      const { settings } = body;
      for (const item of settings) {
        await this.createOrUpdate(item);
      }
      await this.initGetAllConfig();
      const keys = settings.map((t) => t.configKey);
      /* 如果修改的包含了百度雲文本檢測選擇、則需要觸發更新重新獲取token */
      if (
        keys.includes('baiduTextApiKey') ||
        keys.includes('baiduTextSecretKey')
      ) {
        await this.initBaiduSensitive(false);
      }
      /* 如果變更微信配置 則需要手動刷新微信 access_token */
      if (
        keys.includes('wechatOfficialAppId') ||
        keys.includes('wechatOfficialAppSecret')
      ) {
        await this.getWechatAccessToken();
      }

      return '設置完成！';
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /* 創建或更新配置資訊 */
  async createOrUpdate(setting) {
    /* 後期追加配置非自動化的需要手動追加為public讓前端查找 */
    try {
      const { configKey, configVal, status = 1 } = setting;
      const c = await this.configEntity.findOne({ where: { configKey } });
      if (c) {
        const res = await this.configEntity.update(
          { configKey },
          { configVal, status }
        );
      } else {
        const save = await this.configEntity.save({
          configKey,
          configVal,
          status,
        });
      }
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('設置配置資訊錯誤！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 查詢公告資訊 */
  async queryNotice() {
    return await this.getConfigs(['noticeInfo', 'noticeTitle']);
  }

  /* 開啟多個支付規則的時候 按順序只使用一個 */
  async queryPayType() {
    try {
      // 獲取所有支付配置
      const configs = await this.getConfigs([
        'payEcpayStatus',
        'payEcpayMerchantId',
        'payEcpayHashKey',
        'payEcpayHashIV',
        'payWechatStatus',
        'payEpayStatus',
        'payMpayStatus',
        'payHupiStatus',
        'payLtzfStatus'
      ]);

      // 檢查綠界支付配置是否完整且啟用
      if (configs.payEcpayStatus === '1' &&
          configs.payEcpayMerchantId &&
          configs.payEcpayHashKey &&
          configs.payEcpayHashIV) {
        Logger.log('使用綠界支付');
        return 'ecpay';
      }

      // 其他支付方式檢查
      if (configs.payWechatStatus === '1') return 'wechat';
      if (configs.payEpayStatus === '1') return 'epay';
      if (configs.payMpayStatus === '1') return 'mpay';
      if (configs.payHupiStatus === '1') return 'hupi';
      if (configs.payLtzfStatus === '1') return 'ltzf';

      throw new HttpException('支付功能暫未開放!', HttpStatus.BAD_REQUEST);
    } catch (error) {
      Logger.error('查詢支付類型錯誤:', error);
      throw new HttpException('支付功能暫未開放!', HttpStatus.BAD_REQUEST);
    }
  }

  /* get auth info */
  async getAuthInfo() {
    const { siteName, registerBaseUrl, domain } = await this.getConfigs([
      'siteName',
      'registerBaseUrl',
      'domain',
    ]);
    return { siteName, registerBaseUrl, domain };
  }

  /* get phone verify config */
  async getPhoneVerifyConfig() {
    const {
      phoneLoginStatus,
      aliPhoneAccessKeyId,
      aliPhoneAccessKeySecret,
      aliPhoneSignName,
      aliPhoneTemplateCode,
    } = await this.getConfigs([
      'phoneLoginStatus',
      'aliPhoneAccessKeyId',
      'aliPhoneAccessKeySecret',
      'aliPhoneSignName',
      'aliPhoneTemplateCode',
    ]);
    if (Number(phoneLoginStatus) !== 1) {
      throw new HttpException(
        '手機驗證碼功能暫未開放!',
        HttpStatus.BAD_REQUEST
      );
    }
    return {
      accessKeyId: aliPhoneAccessKeyId,
      accessKeySecret: aliPhoneAccessKeySecret,
      SignName: aliPhoneSignName,
      TemplateCode: aliPhoneTemplateCode,
    };
  }

  /* get namespace */
  getNamespace() {
    return process.env.NAMESPACE || 'AIWeb';
  }

  /* 獲取簽名贈送額度 */
  async getSignatureGiftConfig() {
    const {
      signInStatus = 0,
      signInModel3Count = 0,
      signInModel4Count = 0,
      signInMjDrawToken = 0,
    } = await this.getConfigs([
      'signInStatus',
      'signInModel3Count',
      'signInModel4Count',
      'signInMjDrawToken',
    ]);
    if (Number(signInStatus) !== 1) {
      throw new HttpException('簽到功能暫未開放!', HttpStatus.BAD_REQUEST);
    }
    return {
      model3Count: Number(signInModel3Count),
      model4Count: Number(signInModel4Count),
      drawMjCount: Number(signInMjDrawToken),
    };
  }

  async auth() {
    const api = '';
    const response = await fetch(api, {});
    const responseData: any = await response.json();
    const { success = true, message } = responseData;

    Logger.debug('感謝您使用AIWeb，祝您使用愉快~');
  }

  /* 拿到敏感次配置 都開啟優先使用百度雲 */
  async getSensitiveConfig() {
    const { baiduTextStatus = 0, baiduTextAccessToken } = await this.getConfigs(
      ['baiduTextStatus', 'baiduTextAccessToken']
    );
    if (Number(baiduTextStatus) === 1) {
      return {
        useType: 'baidu',
        baiduTextAccessToken,
      };
    }
    return null;
  }
}
