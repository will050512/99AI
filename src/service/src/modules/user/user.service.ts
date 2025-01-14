import { RechargeType } from '@/common/constants/balance.constant';
import { VerificationEnum } from '@/common/constants/verification.constant';
import {
  createRandomUid,
  getClientIp,
  maskEmail,
  maskIpAddress,
} from '@/common/utils';
import { MailerService } from '../mailer/mailer.service';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import * as _ from 'lodash';
import { Connection, In, Like, Not, Repository, UpdateResult } from 'typeorm';
import { UserRegisterDto } from '../auth/dto/authRegister.dto';
import { ConfigEntity } from '../globalConfig/config.entity';
import { UserBalanceService } from '../userBalance/userBalance.service';
import {
  UserStatusEnum,
  UserStatusErrMsg,
} from './../../common/constants/user.constant';
import { GlobalConfigService } from './../globalConfig/globalConfig.service';
import { VerificationService } from './../verification/verification.service';
import { VerifycationEntity } from './../verification/verifycation.entity';
import { QueryAllUserDto } from './dto/queryAllUser.dto';
import { ResetUserPassDto } from './dto/resetUserPass.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateUserStatusDto } from './dto/updateUserStatus.dto';
import { UserRechargeDto } from './dto/userRecharge.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    private readonly connection: Connection,
    private readonly verificationService: VerificationService,
    private readonly mailerService: MailerService,
    private readonly userBalanceService: UserBalanceService,
    private readonly globalConfigService: GlobalConfigService,
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>
  ) {}

  /* create and verify */
  async createUserAndVerifycation(
    user: UserEntity | UserRegisterDto,
    req: Request
  ): Promise<UserEntity> {
    const { username, email, password, client = 0 } = user;

    /* 用戶是否已經在系統中 */
    const where = [{ username }, { email }];
    const u: UserEntity = await this.userEntity.findOne({ where: where });

    if (u && u.status !== UserStatusEnum.PENDING) {
      throw new HttpException(
        '用戶名或者郵箱已被註冊！',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const userInput: any = _.cloneDeep(user);
      const hashedPassword = bcrypt.hashSync(password, 10);
      const ip = getClientIp(req);
      userInput.password = hashedPassword;
      userInput.registerIp = ip;
      userInput.client = client;

      let n: UserEntity;
      /* 如果沒有註冊用戶則首次註冊記錄 如果註冊了覆蓋發送驗證碼即可 無需記錄用戶 */
      if (!u) {
        const userDefautlAvatar = await this.globalConfigService.getConfigs([
          'userDefautlAvatar',
        ]);
        userInput.avatar = userDefautlAvatar;
        n = await this.userEntity.save(userInput);
      } else {
        n = u;
      }
      const emailConfigs = await this.configEntity.find({
        where: {
          configKey: In([
            'isVerifyEmail',
            'registerBaseUrl',
            'registerVerifyEmailTitle',
            'registerVerifyEmailDesc',
            'registerVerifyEmailFrom',
            'registerVerifyExpir',
          ]),
        },
      });

      const configMap: any = emailConfigs.reduce((pre, cur: any) => {
        pre[cur.configKey] = cur.configVal;
        return pre;
      }, {});

      const isVerifyEmail = configMap['isVerifyEmail']
        ? Number(configMap['isVerifyEmail'])
        : 1;
      if (isVerifyEmail) {
        const expir = configMap['registerVerifyExpir']
          ? Number(configMap['registerVerifyExpir'])
          : 30 * 60;
        const v: VerifycationEntity =
          await this.verificationService.createVerification(
            n,
            VerificationEnum.Registration,
            expir
          );
        const { code, email, id } = v;
        const { registerVerifyEmailFrom } = configMap;
        console.log('configMap: ', configMap);

        console.log(`嘗試發送郵件到: ${email}`); // 在嘗試發送郵件之前打印日誌

        // try {
        //   await this.mailerService.sendMail({
        //     to: email,
        //     subject: `來自${registerVerifyEmailFrom}的賬號激活`,
        //     context: {
        //       // 這裡傳入模板中使用的變量和數據
        //       registerVerifyEmailTitle: configMap['registerVerifyEmailTitle'],
        //       registerVerifyEmailDesc: configMap['registerVerifyEmailDesc'],
        //       baseUrl: configMap['registerBaseUrl'],
        //       code: code,
        //       id: id,
        //       registerVerifyEmailFrom: registerVerifyEmailFrom,
        //     },
        //   });

        //   console.log('郵件發送成功'); // 如果郵件發送成功，打印成功的消息
        // } catch (error) {
        //   console.error('郵件發送失敗', error); // 捕獲並處理異常
        //   // 在這裡可以進一步處理錯誤，比如重試發送、記錄錯誤詳情到日誌系統、通知管理員等
        // }
      } else {
        /* 如果沒有郵箱驗證則 則直接主動註冊驗證通過邏輯 */
        const { id } = n;
        await this.updateUserStatus(id, UserStatusEnum.ACTIVE);
        await this.userBalanceService.addBalanceToNewUser(id);
      }
      return n;
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async getSuper() {
    const user = await this.userEntity.findOne({ where: { role: 'super' } });
    return user;
  }

  /* 賬號登錄驗證密碼 掃碼登錄則不用 */
  async verifyUserCredentials(user): Promise<UserEntity> {
    const { username, password, uid = 0, phone } = user;
    let u = null;

    /* 三方登錄的 */
    if (uid > 0) {
      u = await this.userEntity.findOne({ where: { id: uid } });
      if (!u) {
        throw new HttpException('當前賬戶不存在！', HttpStatus.BAD_REQUEST);
      }
      if (!bcrypt.compareSync(password, u.password)) {
        throw new HttpException('當前密碼錯誤！', HttpStatus.BAD_REQUEST);
      }
    }

    /* 普通登錄 */
    if (username && password) {
      const where: any = [
        { username },
        { email: username },
        { phone: username },
      ];
      u = await this.userEntity.findOne({ where: where });
      if (!u) {
        throw new HttpException('當前賬戶不存在！', HttpStatus.BAD_REQUEST);
      }
      if (!bcrypt.compareSync(password, u.password)) {
        throw new HttpException('當前密碼錯誤！', HttpStatus.BAD_REQUEST);
      }
    }

    if (!u) {
      throw new HttpException('當前賬戶不存在！', HttpStatus.BAD_REQUEST);
    }
    if (u.status !== UserStatusEnum.ACTIVE) {
      throw new HttpException(
        UserStatusErrMsg[u.status],
        HttpStatus.BAD_REQUEST
      );
    }

    return u;
  }

  async verifyUserPassword(userId, password) {
    const u = await this.userEntity.findOne({ where: { id: userId } });
    return bcrypt.compareSync(password, u.password);
  }

  async updateUserStatus(id: number, status: UserStatusEnum) {
    const u: UpdateResult = await this.userEntity.update({ id }, { status });
    return u.affected > 0;
  }

  async getUserStatus(id: number): Promise<number> {
    const u: UserEntity = await this.userEntity.findOne({ where: { id } });
    return u.status;
  }

  async queryUserInfoById(id: number): Promise<UserEntity> {
    return await this.userEntity.findOne({ where: { id } });
  }

  async queryOneUserInfo(userId: number): Promise<UserEntity> {
    return await this.userEntity.findOne({ where: { id: userId } });
  }

  /* 檢查用戶狀態 */
  async checkUserStatus(user) {
    const { id: userId, role } = user;
    if (role === 'visitor') return true;
    const u = await this.userEntity.findOne({ where: { id: userId } });
    if (!u) {
      throw new HttpException(
        '當前用戶資訊失效、請重新登錄！',
        HttpStatus.UNAUTHORIZED
      );
    }
    if (u.status === UserStatusEnum.BLACKLISTED) {
      throw new HttpException(
        '您的賬戶已被永久加入黑名單、如有疑問、請聯繫管理員！',
        HttpStatus.BAD_REQUEST
      );
    }
    if (u.status === UserStatusEnum.LOCKED) {
      throw new HttpException(
        '您的賬戶已被封禁、如有疑問、請聯繫管理員！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 獲取用戶基礎資訊 */
  async getUserInfo(userId: number) {
    const userInfo: any = await this.userEntity.findOne({
      where: { id: userId },
      select: [
        'username',
        'avatar',
        'role',
        'email',
        'sign',
        'openId',
        'consecutiveDays',
      ],
    });

    if (!userInfo) {
      throw new HttpException(
        '當前用戶資訊失效、請重新登錄！',
        HttpStatus.UNAUTHORIZED
      );
    }

    userInfo.isBindWx = !!userInfo?.openId;
    delete userInfo.openId;

    const userBalance = await this.userBalanceService.queryUserBalance(userId);

    // 對id進行處理
    const processedId = (userId * 123 + 100000000)
      .toString(36)
      .toUpperCase()
      .slice(-6);

    // 將處理後的id放入userInfo對象中
    userInfo.id = processedId;

    return { userInfo, userBalance: { ...userBalance } };
  }

  /* 獲取用戶資訊 */
  async getUserById(id: number) {
    return await this.userEntity.findOne({ where: { id } });
  }

  /* 通過openId獲取用戶資訊 */
  async getUserOpenId(openId: string) {
    return await this.userEntity.findOne({ where: { openId } });
  }

  /* 修改用戶資訊 */
  async updateInfo(body: UpdateUserDto, req: Request) {
    const { id } = req.user;

    const u = await this.userEntity.findOne({ where: { id } });
    if (!u) {
      throw new HttpException('當前用戶不存在！', HttpStatus.BAD_REQUEST);
    }
    if (body.username && u.username === body.username) {
      throw new HttpException('沒有變更，無需更改！', HttpStatus.BAD_REQUEST);
    }

    if (body.username) {
      const usernameTaken = await this.isUsernameTaken(body.username, id);
      if (usernameTaken) {
        throw new HttpException('用戶名已存在！', HttpStatus.BAD_REQUEST);
      }
    }

    const r = await this.userEntity.update({ id }, body);
    if (r.affected <= 0) {
      throw new HttpException('修改用戶資訊失敗！', HttpStatus.BAD_REQUEST);
    }
    return '修改用戶資訊成功！';
  }

  /* 檢查用戶名是否已存在 */
  async isUsernameTaken(
    username: string,
    excludeUserId?: number
  ): Promise<boolean> {
    const where: any = { username };
    if (excludeUserId) {
      where.id = Not(excludeUserId);
    }
    const user = await this.userEntity.findOne({ where });
    return !!user;
  }

  /* 修改用戶密碼 */
  async updateUserPassword(userId: number, password: string) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const r = await this.userEntity.update(
      { id: userId },
      { password: hashedPassword }
    );
    if (r.affected <= 0) {
      throw new HttpException(
        '修改密碼失敗、請重新試試吧。',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 給用戶充值 */
  async userRecharge(body: UserRechargeDto) {
    const { userId, model3Count = 0, model4Count = 0, drawMjCount = 0 } = body;
    await this.userBalanceService.addBalanceToUser(userId, {
      model3Count,
      model4Count,
      drawMjCount,
    });
    const res = await this.userBalanceService.saveRecordRechargeLog({
      userId,
      rechargeType: RechargeType.ADMIN_GIFT,
      model3Count,
      model4Count,
      drawMjCount,
      extent: '',
    });
    return res;
  }

  /* 查詢所有用戶 */
  async queryAll(query: QueryAllUserDto, req: Request) {
    const {
      page = 1,
      size = 10,
      username,
      email,
      status,
      keyword,
      phone,
    } = query;
    let where = {};
    username && Object.assign(where, { username: Like(`%${username}%`) });
    email && Object.assign(where, { email: Like(`%${email}%`) });
    phone && Object.assign(where, { phone: Like(`%${phone}%`) });
    status && Object.assign(where, { status });
    if (keyword) {
      where = [
        { username: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
        { phone: Like(`%${keyword}%`) },
      ];
    }
    const [rows, count] = await this.userEntity.findAndCount({
      skip: (page - 1) * size,
      where,
      take: size,
      order: { createdAt: 'DESC' },
      cache: true,
      select: [
        'username',
        'avatar',
        'role',
        'sign',
        'status',
        'id',
        'email',
        'createdAt',
        'lastLoginIp',
        'phone',
        'realName',
        'idCard',
      ],
    });
    const ids = rows.map((t) => t.id);
    const data = await this.userBalanceService.queryUserBalanceByIds(ids);
    rows.forEach(
      (user: any) => (user.balanceInfo = data.find((t) => t.userId === user.id))
    );
    req.user.role !== 'super' &&
      rows.forEach((t) => (t.email = maskEmail(t.email)));
    req.user.role !== 'super' &&
      rows.forEach((t) => (t.lastLoginIp = maskIpAddress(t.lastLoginIp)));
    req.user.role !== 'super' &&
      rows.forEach((t) => (t.phone = maskIpAddress(t.phone)));
    return { rows, count };
  }

  /* 查詢單個用戶詳情 */
  async queryOne({ id }) {
    return await this.userEntity.findOne({
      where: { id },
      select: ['username', 'avatar', 'role', 'sign', 'status'],
    });
  }

  /* 修改用戶狀態 */
  async updateStatus(body: UpdateUserStatusDto) {
    const { id, status } = body;
    const n = await this.userEntity.findOne({ where: { id } });
    if (!n) {
      throw new HttpException('用戶不存在！', HttpStatus.BAD_REQUEST);
    }
    if (n.role === 'super') {
      throw new HttpException('超級管理員不可被操作！', HttpStatus.BAD_REQUEST);
    }
    // if (n.status === UserStatusEnum.PENDING) {
    //   throw new HttpException('未激活用戶不可手動變更狀態！', HttpStatus.BAD_REQUEST);
    // }
    if (n.role === 'super') {
      throw new HttpException('超級管理員不可被操作！', HttpStatus.BAD_REQUEST);
    }
    // if (status === UserStatusEnum.PENDING) {
    //   throw new HttpException('不可將用戶置為未激活狀態！', HttpStatus.BAD_REQUEST);
    // }
    const r = await this.userEntity.update({ id }, { status });
    if (r.affected <= 0) {
      throw new HttpException('修改用戶狀態失敗！', HttpStatus.BAD_REQUEST);
    }
    return '修改用戶狀態成功！';
  }

  /* 重置用戶密碼 */
  async resetUserPass(body: ResetUserPassDto) {
    const { id } = body;
    const u = await this.userEntity.findOne({ where: { id } });
    if (!u) {
      throw new HttpException('用戶不存在！', HttpStatus.BAD_REQUEST);
    }
    const defaultPassword = '123456';
    const hashPassword = bcrypt.hashSync(defaultPassword, 10);
    const raw = await this.userEntity.update(
      { id },
      { password: hashPassword }
    );
    if (raw.affected <= 0) {
      throw new HttpException('重置密碼失敗！', HttpStatus.BAD_REQUEST);
    }
    return `密碼重置為[${defaultPassword}]成功!`;
  }

  /* 記錄登錄ip */
  async savaLoginIp(userId: number, ip: string) {
    return await this.userEntity.update({ id: userId }, { lastLoginIp: ip });
  }

  /* 通過openId 拿到或創建 */
  async getUserFromOpenId(openId: string, sceneStr?: string) {
    const user = await this.userEntity.findOne({ where: { openId } });
    if (!user) {
      const user = await this.createUserFromOpenId(openId);
      await this.userBalanceService.addBalanceToNewUser(user.id);
      return user;
    }
    return user;
  }

  /* 通過openId創建一個用戶, 傳入邀請碼 是邀請人的不是自己的 */
  async createUserFromOpenId(openId: string) {
    const userDefautlAvatar = await this.globalConfigService.getConfigs([
      'userDefautlAvatar',
    ]);
    const userInfo = {
      avatar: userDefautlAvatar,
      username: `用戶${createRandomUid()}`,
      status: UserStatusEnum.ACTIVE,
      sex: 0,
      email: `${createRandomUid()}@default.com`,
      openId,
    };
    const user = await this.userEntity.save(userInfo);
    return user;
  }

  /* 通過openId創建一個用戶, 傳入邀請碼 是邀請人的不是自己的 */
  async createUserFromContact(params: any) {
    const { username, email, phone } = params;
    const userDefautlAvatar = await this.globalConfigService.getConfigs([
      'userDefautlAvatar',
    ]);
    // 創建 userInfo 對象時條件性地添加 email 和 phone
    const userInfo: any = {
      avatar: userDefautlAvatar,
      username: `用戶${createRandomUid()}`,
      status: UserStatusEnum.ACTIVE,
      sex: 0,
    };

    if (username) {
      userInfo.username = username;
    }

    if (email) {
      userInfo.email = email;
    }

    if (phone) {
      userInfo.phone = phone;
    }

    const user = await this.userEntity.save(userInfo);
    return user;
  }

  async getUserByContact(params: any) {
    const { username, email, phone } = params;
    const where: any = [];
    if (username) {
      where.push({ username });
    }
    if (email) {
      where.push({ email });
    }
    if (phone) {
      where.push({ phone });
    }
    return await this.userEntity.findOne({ where });
  }

  async bindWx(openId, userId) {
    try {
      const user = await this.userEntity.findOne({ where: { id: userId } });
      if (!user) return { status: false, msg: '當前綁定用戶不存在！' };
      const bindU = await this.userEntity.findOne({ where: { openId } });
      if (bindU) return { status: false, msg: '該微信已綁定其他賬號！' };
      const res = await this.userEntity.update({ id: userId }, { openId });
      if (res.affected <= 0)
        return { status: false, msg: '綁定微信失敗、請聯繫管理員！' };
      return { status: true, msg: '恭喜您綁定成功、後續可直接掃碼登錄了！' };
    } catch (error) {
      return { status: false, msg: '綁定微信失敗、請聯繫管理員！' };
    }
  }

  /* 通過userId獲取用戶的openId */
  async getOpenIdByUserId(userId: number) {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    return user?.openId;
  }

  /* 校驗手機號/郵箱號註冊 */
  async verifyUserRegister(params: any): Promise<boolean> {
    const { username, phone, email } = params;

    // 如果提供了手機號，就驗證手機號
    if (phone) {
      const userByPhone = await this.userEntity.findOne({ where: { phone } });
      if (userByPhone) {
        // 手機號已註冊，返回 false
        return false;
      }
    }

    // 如果提供了郵箱，就驗證郵箱
    if (email) {
      const userByEmail = await this.userEntity.findOne({ where: { email } });
      if (userByEmail) {
        // 郵箱已註冊，返回 false
        return false;
      }
    }

    // 驗證用戶名是否已存在
    if (username) {
      const userByUsername = await this.userEntity.findOne({
        where: { username },
      });
      if (userByUsername) {
        // 用戶名已存在，返回 false
        return false;
      }
    }

    if (!phone && !email && !username) {
      return false;
    }

    // 所有檢查都通過，沒有發現重複的註冊資訊，返回 true
    return true;
  }

  /* 校驗手機號註冊 */
  async verifyUserRegisterByPhone(params: any) {
    const { username, password, phone, phoneCode } = params;
    const user = await this.userEntity.findOne({
      where: [{ username }, { phone }],
    });
    if (user && user.username === username) {
      throw new HttpException(
        '用戶名已存在、請更換用戶名！',
        HttpStatus.BAD_REQUEST
      );
    }
    if (user && user.phone === phone) {
      throw new HttpException(
        '當前手機號已註冊、請勿重複註冊！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 校驗郵箱註冊 */
  async verifyUserRegisterByEmail(params: any) {
    const { username, email } = params;
    console.log(`校驗郵箱註冊: 開始 - 用戶名: ${username}, 郵箱: ${email}`);

    // 查找數據庫中是否存在該用戶名或郵箱
    const user = await this.userEntity.findOne({
      where: [{ username }, { email }],
    });

    // 校驗用戶名是否已存在
    if (user && user.username === username) {
      console.error(`校驗失敗: 用戶名 "${username}" 已存在`);
      throw new HttpException(
        '用戶名已存在、請更換用戶名！',
        HttpStatus.BAD_REQUEST
      );
    }

    // 校驗郵箱是否已被註冊
    // 注意：這裡應檢查user.email而不是user.phone，除非你的數據模型是這樣設計的
    if (user && user.email === email) {
      console.error(`校驗失敗: 郵箱 "${email}" 已被註冊`);
      throw new HttpException(
        '當前郵箱已註冊、請勿重複註冊！',
        HttpStatus.BAD_REQUEST
      );
    }

    console.log(
      `校驗郵箱註冊: 成功 - 用戶名: ${username}, 郵箱: ${email} 未被佔用`
    );
  }

  /* 創建基礎用戶 */
  async createUser(userInfo) {
    return await this.userEntity.save(userInfo);
  }

  /* 儲存實名資訊 */
  async saveRealNameInfo(userId: number, realName: string, idCard: string) {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (!user) {
      Logger.error('用戶不存在');
    }
    await this.userEntity.update({ id: userId }, { realName, idCard });
    return;
  }

  /* 更新用戶手機號，用戶名，密碼 */
  async updateUserPhone(
    userId: number,
    phone: string,
    username: string,
    password: string
  ) {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (!user) {
      Logger.error('用戶不存在');
    }
    if (!phone || !username || !hashedPassword) {
      throw new HttpException('參數錯誤！', HttpStatus.BAD_REQUEST);
    }
    await this.userEntity.update(
      { id: userId },
      { phone, username, password: hashedPassword }
    );
    return;
  }
}
