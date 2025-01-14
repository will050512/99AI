import {
  UserStatusEnum,
  UserStatusErrMsg,
} from '@/common/constants/user.constant';
import { createRandomCode, createRandomUid, getClientIp } from '@/common/utils';
import { GlobalConfigService } from '@/modules/globalConfig/globalConfig.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import * as os from 'os';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../globalConfig/config.entity';
import { MailerService } from '../mailer/mailer.service';
import { RedisCacheService } from '../redisCache/redisCache.service';
import { UserService } from '../user/user.service';
import { UserBalanceService } from '../userBalance/userBalance.service';
import { UserEntity } from './../user/user.entity';
import { VerificationService } from './../verification/verification.service';
import { UserLoginDto } from './dto/authLogin.dto';
import { UpdatePassByOtherDto } from './dto/updatePassByOther.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class AuthService {
  private ipAddress: string;

  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>,
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private readonly verificationService: VerificationService,
    private readonly userBalanceService: UserBalanceService,
    private readonly redisCacheService: RedisCacheService,
    private readonly globalConfigService: GlobalConfigService // private readonly userEntity: Repository<UserEntity>
  ) {}

  async onModuleInit() {
    this.getIp();
  }

  async register(body: any, req: Request) {
    const { password, contact, code } = body;
    let email = '',
      phone = '';

    // 判斷 contact 是郵箱還是手機號
    const isEmail = /\S+@\S+\.\S+/.test(contact);
    const isPhone = /^\d{10,}$/.test(contact); // 根據實際需求調整正則表達式
    Logger.debug(
      `Contact: ${contact}, isEmail: ${isEmail}, isPhone: ${isPhone}`
    );

    // 創建用戶
    let username = createRandomUid();
    while (true) {
      const usernameTaken = await this.userService.verifyUserRegister({
        username,
      });
      Logger.debug(
        `Checking if username ${username} is taken: ${usernameTaken}`
      );
      if (usernameTaken) {
        break;
      }
      username = createRandomUid();
    }

    if (isEmail) {
      email = contact;
      // 調用更新後的驗證方法驗證郵箱是否已註冊
      const isAvailable = await this.userService.verifyUserRegister({
        username,
        email,
      });
      Logger.debug(`Email ${email} is available: ${isAvailable}`);
      if (!isAvailable) {
        throw new HttpException(
          '當前郵箱已註冊，請勿重複註冊！',
          HttpStatus.BAD_REQUEST
        );
      }
    } else if (isPhone) {
      phone = contact;
      const isAvailable = await this.userService.verifyUserRegister({
        username,
        phone,
      });
      Logger.debug(`Phone ${phone} is available: ${isAvailable}`);
      if (!isAvailable) {
        throw new HttpException(
          '當前手機號已註冊，請勿重複註冊！',
          HttpStatus.BAD_REQUEST
        );
      }
    } else {
      throw new HttpException(
        '請提供有效的郵箱地址或手機號碼。',
        HttpStatus.BAD_REQUEST
      );
    }

    const noVerifyRegister = await this.globalConfigService.getConfigs([
      'noVerifyRegister',
    ]);
    Logger.debug(`noVerifyRegister: ${noVerifyRegister}`);

    if (noVerifyRegister !== '1') {
      // 校驗驗證碼是否過期或錯誤
      const nameSpace = await this.globalConfigService.getNamespace();
      const key = `${nameSpace}:CODE:${contact}`;
      const redisCode = await this.redisCacheService.get({ key });
      Logger.debug(`Retrieved redisCode for ${contact}: ${redisCode}`);
      if (code === '') {
        throw new HttpException('請輸入驗證碼', HttpStatus.BAD_REQUEST);
      }
      if (!redisCode) {
        Logger.log(`驗證碼過期: ${contact}`, 'authService');
        throw new HttpException(
          '驗證碼已過期，請重新發送！',
          HttpStatus.BAD_REQUEST
        );
      }

      if (code !== redisCode) {
        Logger.log(
          `驗證碼錯誤: ${contact} 輸入的驗證碼: ${code}, 期望的驗證碼: ${redisCode}`,
          'authService'
        );
        throw new HttpException(
          '驗證碼填寫錯誤，請重新輸入！',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    let newUser: any;
    if (isEmail) {
      newUser = {
        username,
        password,
        email: contact,
        status: UserStatusEnum.ACTIVE,
      };
    } else {
      const email = `${createRandomUid()}@aiweb.com`;
      newUser = {
        username,
        password,
        email,
        phone: contact,
        status: UserStatusEnum.ACTIVE,
      };
    }

    Logger.debug('獲取默認用戶頭像...');
    const userDefautlAvatar = await this.globalConfigService.getConfigs([
      'userDefautlAvatar',
    ]);
    Logger.debug(`使用默認用戶頭像: ${userDefautlAvatar}`);
    newUser.avatar = userDefautlAvatar;
    Logger.debug('加密用戶密碼...');
    const hashedPassword = bcrypt.hashSync(password, 10);
    newUser.password = hashedPassword;
    Logger.debug('保存新用戶到數據庫...');
    const u = await this.userService.createUser(newUser);
    Logger.debug(`用戶創建成功，用戶ID: ${u.id}`);
    /* 如果有邀請人 給與充值獎勵 */
    await this.userBalanceService.addBalanceToNewUser(u.id);
    Logger.debug('完成新用戶餘額處理');
    return { success: true, message: '註冊成功' };
  }

  async login(user: UserLoginDto, req: Request): Promise<string> {
    console.log(`開始用戶登錄流程，用戶名: ${user.username}`);

    // 驗證用戶憑證
    const u: UserEntity = await this.userService.verifyUserCredentials(user);
    if (!u) {
      console.error(`登錄失敗: 用戶憑證無效 - 用戶名: ${user.username}`);
      throw new HttpException(
        '登錄失敗，用戶憑證無效。',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { username, id, email, role, openId, client, phone } = u;
    console.log(`用戶憑證驗證成功，用戶ID: ${id}, 用戶名: ${username}`);

    // 保存登錄IP
    const ip = getClientIp(req);
    await this.userService.savaLoginIp(id, ip);
    console.log(`保存登錄IP: ${ip} - 用戶ID: ${id}`);

    // 生成JWT令牌
    const token = await this.jwtService.sign({
      username,
      id,
      email,
      role,
      openId,
      client,
      phone,
    });
    console.log(`JWT令牌生成成功 - 用戶ID: ${id}`);

    // 保存令牌到Redis
    await this.redisCacheService.saveToken(id, token);
    console.log(`令牌已保存到Redis - 用戶ID: ${id}`);

    return token;
  }

  async loginWithCaptcha(body: any, req: Request): Promise<string> {
    const { contact, code } = body;
    let email = '',
      phone = '';

    // 判斷 contact 是郵箱還是手機號
    const isEmail = /\S+@\S+\.\S+/.test(contact);
    const isPhone = /^\d{10,}$/.test(contact); // 根據實際需求調整正則表達式

    if (isEmail) {
      email = contact;
    } else if (isPhone) {
      phone = contact;
    } else {
      throw new HttpException(
        '請提供有效的郵箱地址或手機號碼。',
        HttpStatus.BAD_REQUEST
      );
    }
    const isAvailable = await this.userService.verifyUserRegister({
      email,
      phone,
    });

    // 校驗驗證碼是否過期或錯誤
    const nameSpace = await this.globalConfigService.getNamespace();
    const key = `${nameSpace}:CODE:${contact}`;
    const redisCode = await this.redisCacheService.get({ key });
    if (!redisCode) {
      Logger.log(`驗證碼過期: ${contact}`, 'authService');
      throw new HttpException(
        '驗證碼已過期，請重新發送！',
        HttpStatus.BAD_REQUEST
      );
    }
    if (code !== redisCode) {
      Logger.log(
        `驗證碼錯誤: ${contact} 輸入的驗證碼: ${code}, 期望的驗證碼: ${redisCode}`,
        'authService'
      );
      throw new HttpException(
        '驗證碼填寫錯誤，請重新輸入！',
        HttpStatus.BAD_REQUEST
      );
    }

    let u;
    if (isAvailable) {
      // 驗證用戶憑證
      u = await this.userService.createUserFromContact({ email, phone });
    } else {
      u = await this.userService.getUserByContact({ email, phone });
    }

    if (!u) {
      throw new HttpException(
        '登錄失敗，用戶憑證無效。',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { username, id, role, openId, client } = u;
    console.log(`用戶憑證驗證成功，用戶ID: ${id}, 用戶名: ${username}`);

    // 保存登錄IP
    const ip = getClientIp(req);
    await this.userService.savaLoginIp(id, ip);
    console.log(`保存登錄IP: ${ip} - 用戶ID: ${id}`);

    // 生成JWT令牌
    const token = await this.jwtService.sign({
      username,
      id,
      email,
      role,
      openId,
      client,
      phone,
    });
    console.log(`JWT令牌生成成功 - 用戶ID: ${id}`);

    // 保存令牌到Redis
    await this.redisCacheService.saveToken(id, token);
    console.log(`令牌已保存到Redis - 用戶ID: ${id}`);

    return token;
  }

  async loginByOpenId(user: UserEntity, req: Request): Promise<string> {
    const { status } = user;
    if (status !== UserStatusEnum.ACTIVE) {
      throw new HttpException(UserStatusErrMsg[status], HttpStatus.BAD_REQUEST);
    }
    const { username, id, email, role, openId, client } = user;
    const ip = getClientIp(req);
    await this.userService.savaLoginIp(id, ip);
    const token = await this.jwtService.sign({
      username,
      id,
      email,
      role,
      openId,
      client,
    });
    await this.redisCacheService.saveToken(id, token);
    return token;
  }

  async getInfo(req: Request) {
    const { id } = req.user;
    return await this.userService.getUserInfo(id);
  }

  async updatePassword(req: Request, body: UpdatePasswordDto) {
    const { id, client, role } = req.user;
    if (client && Number(client) > 0) {
      throw new HttpException(
        '無權此操作、請聯繫管理員！',
        HttpStatus.BAD_REQUEST
      );
    }
    if (role === 'admin') {
      throw new HttpException(
        '非法操作、請聯繫管理員！',
        HttpStatus.BAD_REQUEST
      );
    }
    // const bool = await this.userService.verifyUserPassword(id, body.oldPassword);
    // if (!bool) {
    //   throw new HttpException('舊密碼錯誤、請檢查遞交', HttpStatus.BAD_REQUEST);
    // }
    this.userService.updateUserPassword(id, body.password);
    return '密碼修改成功';
  }

  async updatePassByOther(req: Request, body: UpdatePassByOtherDto) {
    const { id, client } = req.user;
    if (!client) {
      throw new HttpException('無權此操作！', HttpStatus.BAD_REQUEST);
    }
    this.userService.updateUserPassword(id, body.password);
    return '密碼修改成功';
  }

  getIp() {
    let ipAddress: string;
    const interfaces = os.networkInterfaces();
    Object.keys(interfaces).forEach((interfaceName) => {
      const interfaceInfo = interfaces[interfaceName];
      for (let i = 0; i < interfaceInfo.length; i++) {
        const alias = interfaceInfo[i];
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal
        ) {
          ipAddress = alias.address;
          break;
        }
      }
    });
    this.ipAddress = ipAddress;
  }

  /* 發送驗證證碼 */
  async sendCode(body: any) {
    const { contact, isLogin } = body;

    let email = '',
      phone = '';
    const code = createRandomCode();

    // 判斷 contact 是郵箱還是手機號
    const isEmail = /\S+@\S+\.\S+/.test(contact);
    const isPhone = /^\d{10,}$/.test(contact); // 根據實際需求調整正則表達式

    if (!isEmail && !isPhone) {
      throw new HttpException(
        '請提供有效的郵箱地址或手機號碼。',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!isLogin) {
      if (isEmail) {
        email = contact;
        const isAvailable = await this.userService.verifyUserRegister({
          email,
        });
        if (!isAvailable) {
          throw new HttpException(
            '當前郵箱已註冊，請勿重複註冊！',
            HttpStatus.BAD_REQUEST
          );
        }
      } else if (isPhone) {
        phone = contact;
        const isAvailable = await this.userService.verifyUserRegister({
          phone,
        });
        if (!isAvailable) {
          throw new HttpException(
            '當前手機號已註冊，請勿重複註冊！',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    const nameSpace = await this.globalConfigService.getNamespace();
    const key = `${nameSpace}:CODE:${contact}`;

    // 檢查Redis中是否已經有驗證碼且未過期
    const ttl = await this.redisCacheService.ttl(key);
    if (ttl && ttl > 0 && isPhone) {
      throw new HttpException(
        `${ttl}秒內不得重複發送驗證碼！`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (isEmail) {
      // 檢查Redis中是否已經有驗證碼
      const existingCode = await this.redisCacheService.get({ key });
      if (existingCode) {
        // 如果存在有效的驗證碼，則直接使用這個驗證碼，而不生成新的
        await this.mailerService.sendMail({
          to: email,
          context: {
            // 這裡傳入模板中使用的變量和數據
            code: existingCode,
          },
        });
        return `驗證碼發送成功、請填寫驗證碼完成註冊！`;
      } else {
        // 如果沒有現有驗證碼或驗證碼已過期，則生成新的驗證碼

        // const messageInfo = { email, code };
        try {
          await this.mailerService.sendMail({
            to: email,
            context: {
              // 這裡傳入模板中使用的變量和數據
              code: code,
            },
          });

          console.log('郵件發送成功'); // 如果郵件發送成功，打印成功的消息
        } catch (error) {
          console.error('郵件發送失敗', error); // 捕獲並處理異常
        }
        await this.redisCacheService.set({ key, val: code }, 10 * 60); // 設置驗證碼600秒過期
        return `驗證碼發送成功、請填寫驗證碼完成註冊！`;
      }
    } else if (isPhone) {
      const messageInfo = { phone, code };
      await this.verificationService.sendPhoneCode(messageInfo);
      await this.redisCacheService.set({ key, val: code }, 10 * 60);
      return `驗證碼發送成功、請填寫驗證碼完成註冊！`;
    }
  }

  /* 發送驗證證碼 */
  async sendPhoneCode(body: any) {
    const { phone, isLogin } = body;
    // const { id } = req.user;
    const code = createRandomCode();
    // 判斷 contact 是郵箱還是手機號
    const isPhone = /^\d{10,}$/.test(phone); // 根據實際需求調整正則表達式

    if (!isPhone) {
      throw new HttpException(
        '請提供有效的郵箱地址或手機號碼。',
        HttpStatus.BAD_REQUEST
      );
    }

    if (isLogin) {
      if (isPhone) {
        const isAvailable = await this.userService.verifyUserRegister({
          phone,
        });
        if (!isAvailable) {
          throw new HttpException(
            '當前手機號已註冊，請勿重複註冊！',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    const nameSpace = await this.globalConfigService.getNamespace();
    const key = `${nameSpace}:CODE:${phone}`;

    // 檢查Redis中是否已經有驗證碼且未過期
    const ttl = await this.redisCacheService.ttl(key);
    if (ttl && ttl > 0 && isPhone) {
      throw new HttpException(
        `${ttl}秒內不得重複發送驗證碼！`,
        HttpStatus.BAD_REQUEST
      );
    }

    const messageInfo = { phone, code };
    await this.redisCacheService.set({ key, val: code }, 10 * 60);
    await this.verificationService.sendPhoneCode(messageInfo);

    return `驗證碼發送成功、請填寫驗證碼完成認證！`;
  }

  /* create token */
  createTokenFromFingerprint(fingerprint) {
    const token = this.jwtService.sign({
      username: `遊客${fingerprint}`,
      id: fingerprint,
      email: `${fingerprint}@visitor.com`,
      role: 'visitor',
      openId: null,
      client: null,
    });
    return token;
  }

  async verifyIdentity(req: Request, body) {
    Logger.debug('開始實名認證流程');
    const { name, idCard } = body;

    const { id } = req.user;

    try {
      // 調用驗證服務進行身份驗證
      const result = await this.verificationService.verifyIdentity(body);

      // 輸出驗證結果到日誌
      Logger.debug(`實名認證結果: ${result}`);

      // 檢查驗證結果
      if (!result) {
        throw new HttpException(
          '身份驗證錯誤，請檢查實名資訊',
          HttpStatus.BAD_REQUEST
        );
      }
      // 保存用戶的實名資訊
      await this.userService.saveRealNameInfo(id, name, idCard);
      return '認證成功';
    } catch (error) {
      // 處理可能的錯誤並記錄錯誤資訊
      Logger.error('驗證過程出現錯誤', error);
      throw new HttpException(
        '認證失敗，請檢查相關資訊',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async verifyPhoneIdentity(req: Request, body) {
    Logger.debug('開始手機號認證流程');
    const { phone, username, password, code } = body;
    const { id } = req.user;

    // 校驗驗證碼是否過期或錯誤
    const nameSpace = this.globalConfigService.getNamespace();
    const key = `${nameSpace}:CODE:${phone}`;
    const redisCode = await this.redisCacheService.get({ key });
    Logger.debug(`Retrieved redisCode for ${phone}: ${redisCode}`);
    if (code === '') {
      throw new HttpException('請輸入驗證碼', HttpStatus.BAD_REQUEST);
    }
    if (!redisCode) {
      Logger.log(`驗證碼過期: ${phone}`, 'authService');
      throw new HttpException(
        '驗證碼已過期，請重新發送！',
        HttpStatus.BAD_REQUEST
      );
    }

    if (code !== redisCode) {
      Logger.log(
        `驗證碼錯誤: ${phone} 輸入的驗證碼: ${code}, 期望的驗證碼: ${redisCode}`,
        'authService'
      );
      throw new HttpException(
        '驗證碼填寫錯誤，請重新輸入！',
        HttpStatus.BAD_REQUEST
      );
    }

    // 驗證用戶名是否已存在
    if (username) {
      const usernameTaken = await this.userService.isUsernameTaken(
        body.username,
        id
      );
      if (usernameTaken) {
        throw new HttpException('用戶名已存在！', HttpStatus.BAD_REQUEST);
      }
    }

    try {
      // 保存用戶的實名資訊
      await this.userService.updateUserPhone(id, phone, username, password);
      return '認證成功';
    } catch (error) {
      // 處理可能的錯誤並記錄錯誤資訊
      Logger.error('驗證過程出現錯誤', error);
      throw new HttpException(
        '身份驗證錯誤，請檢查相關資訊',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
