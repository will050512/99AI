import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Connection } from 'typeorm';

interface UserInfo {
  username: string;
  password: string;
  status: number;
  email: string;
  sex: number;
  role: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private connection: Connection) {}
  async onModuleInit() {
    await this.checkSuperAdmin();
    await this.checkSiteBaseConfig();
  }

  /* 默認創建一個超級管理員賬戶 */
  async checkSuperAdmin() {
    const user = await this.connection.query(
      `SELECT * FROM users WHERE role = 'super'`
    );
    if (!user || user.length === 0) {
      const superPassword = bcrypt.hashSync('123456', 10);
      const adminPassword = bcrypt.hashSync('123456', 10);
      const superEmail = 'super';
      const adminEmail = 'admin';
      const superUserinfo = {
        username: 'super',
        password: superPassword,
        status: 1,
        email: superEmail,
        sex: 1,
        role: 'super',
      };
      const adminUserinfo = {
        username: 'admin',
        password: adminPassword,
        status: 0,
        email: adminEmail,
        sex: 1,
        role: 'admin',
      };
      await this.createDefaultUser(superUserinfo);
      await this.createDefaultUser(adminUserinfo);
    }
  }

  /* 初始化創建 超級管理員和管理員 */
  async createDefaultUser(userInfo: UserInfo) {
    try {
      const { username, password, status, email, role } = userInfo;
      const user = await this.connection.query(
        `INSERT INTO users (username, password, status, email, role) VALUES ('${username}', '${password}', '${status}', '${email}', '${role}')`
      );
      const userId = user.insertId;
      await this.connection.query(
        `INSERT INTO balance (userId, balance, usesLeft, paintCount) VALUES ('${userId}', 0, 1000, 100)`
      );
      Logger.log(
        `初始化創建${role}用戶成功、用戶名為[${username}]、初始密碼為[${
          username === 'super' ? 'super' : '123456'
        }] ==============> 請注意查閱`,
        'DatabaseService'
      );
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        '創建默認超級管理員失敗！',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /* 檢測有沒有網站基礎配置 */
  async checkSiteBaseConfig() {
    const keys = ['siteName', 'robotAvatar'];
    const result = await this.connection.query(`
  SELECT COUNT(*) AS count FROM config WHERE \`configKey\` IN (${keys
    .map((k) => `'${k}'`)
    .join(',')})
`);
    const count = parseInt(result[0].count);
    if (count === 0) {
      await this.createBaseSiteConfig();
    }
  }

  /* 創建基礎的網站數據 */
  async createBaseSiteConfig() {
    try {
      const code = ``;

      const noticeInfo = `
#### AiFunSchool一站式平台 歡迎您
 - 歡迎使用 AiFunSchool一站式平台
 - 初始管理員賬號密碼  super  123456 【前臺後臺登錄都可以修改】
 - 初始預覽賬號密碼  admin  123456 【為後臺查看賬號 僅可查看部分非敏感數據】
`;

      const defaultConfig = [
        { configKey: 'siteName', configVal: '', public: 1, encry: 0 },
        { configKey: 'robotAvatar', configVal: '', public: 1, encry: 0 },
        {
          configKey: 'userDefautlAvatar',
          configVal: '',
          public: 0,
          encry: 0,
        },
        { configKey: 'baiduCode', configVal: code, public: 1, encry: 0 },
        { configKey: 'baiduSiteId', configVal: '', public: 0, encry: 0 },
        {
          configKey: 'baiduToken',
          configVal: '',
          public: 0,
          encry: 0,
        },
        { configKey: 'buyCramiAddress', configVal: '', public: 1, encry: 0 },
        {
          configKey: 'openaiBaseUrl',
          configVal: 'https://api.lightai.io',
          public: 0,
          encry: 0,
        },
        { configKey: 'openaiTimeout', configVal: '300', public: 0, encry: 0 },
        { configKey: 'openaiBaseKey', configVal: 'sk-', public: 0, encry: 0 },
        {
          configKey: 'mjTranslatePrompt',
          configVal: `Translate any given phrase from any language into English. For instance, when I input '{可愛的熊貓}', you should output '{cute panda}', with no period at the end.`,
          public: 0,
          encry: 0,
        },

        { configKey: 'noticeInfo', configVal: noticeInfo, public: 1, encry: 0 },
        {
          configKey: 'registerSendStatus',
          configVal: '1',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'registerSendModel3Count',
          configVal: '30',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'registerSendModel4Count',
          configVal: '3',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'registerSendDrawMjCount',
          configVal: '3',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'firstRegisterSendStatus',
          configVal: '1',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'firstRegisterSendRank',
          configVal: '500',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'firstRregisterSendModel3Count',
          configVal: '10',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'firstRregisterSendModel4Count',
          configVal: '10',
          public: 1,
          encry: 0,
        },
        {
          configKey: 'firstRregisterSendDrawMjCount',
          configVal: '10',
          public: 1,
          encry: 0,
        },
        { configKey: 'isVerifyEmail', configVal: '1', public: 1, encry: 0 },
        { configKey: 'model3Name', configVal: '普通積分', public: 1, encry: 0 },
        { configKey: 'model4Name', configVal: '高級積分', public: 1, encry: 0 },
        { configKey: 'drawMjName', configVal: '繪畫積分', public: 1, encry: 0 },
        {
          configKey: 'drawingStyles',
          configVal:
            '油畫風格,像素風格,賽博朋克,動漫,日系,超現實主義,油畫,卡通,插畫,海報,寫實,扁平,中國風,水墨畫,唯美二次元,印象派,炫彩插畫,像素藝術,藝術創想,色彩主義,數字藝術',
          public: 1,
          encry: 0,
        },
      ];

      const res = await this.connection.query(
        `INSERT INTO config (configKey, configVal, public, encry) VALUES ${defaultConfig
          .map(
            (d) =>
              `('${d.configKey}', '${d.configVal.replace(/'/g, "\\'")}', '${
                d.public
              }', '${d.encry}')`
          )
          .join(', ')}`
      );
      Logger.log(
        `初始化網站配置資訊成功、如您需要修改網站配置資訊，請前往管理系統系統配置設置 ==============> 請注意查閱`,
        'DatabaseService'
      );
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        '創建默認網站配置失敗！',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
