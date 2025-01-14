import { RechargeType } from '@/common/constants/balance.constant';
import { createRandomUid, hideString } from '@/common/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { In, LessThan, Repository } from 'typeorm';
import { CramiPackageEntity } from '../crami/cramiPackage.entity';
import { ConfigEntity } from '../globalConfig/config.entity';
import { GlobalConfigService } from './../globalConfig/globalConfig.service';
import { AccountLogEntity } from './accountLog.entity';
import { BalanceEntity } from './balance.entity';
import { UserBalanceEntity } from './userBalance.entity';
// import * as dayjs from 'dayjs';
import dayjs, {
  formatCreateOrUpdateDate,
  formatDate,
} from '@/common/utils/date';
import { ChatGroupEntity } from '../chatGroup/chatGroup.entity';
import { ChatLogEntity } from '../chatLog/chatLog.entity';
import { UserEntity } from '../user/user.entity';
import { FingerprintLogEntity } from './fingerprint.entity';

interface LogInfo {
  userId: number;
  rechargeType: number;
  model3Count?: number;
  model4Count?: number;
  drawMjCount?: number;
  days?: number;
  pkgName?: string;
  extent?: string;
}

interface UserBalanceInfo {
  model3Count?: number;
  model4Count?: number;
  drawMjCount?: number;
}

@Injectable()
export class UserBalanceService {
  constructor(
    @InjectRepository(BalanceEntity)
    private readonly balanceEntity: Repository<BalanceEntity>,
    @InjectRepository(UserBalanceEntity)
    private readonly userBalanceEntity: Repository<UserBalanceEntity>,
    @InjectRepository(AccountLogEntity)
    private readonly accountLogEntity: Repository<AccountLogEntity>,
    @InjectRepository(CramiPackageEntity)
    private readonly cramiPackageEntity: Repository<CramiPackageEntity>,
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(FingerprintLogEntity)
    private readonly fingerprintLogEntity: Repository<FingerprintLogEntity>,
    @InjectRepository(ChatGroupEntity)
    private readonly chatGroupEntity: Repository<ChatGroupEntity>,
    @InjectRepository(ChatLogEntity)
    private readonly chatLogEntity: Repository<ChatLogEntity>,
    private readonly globalConfigService: GlobalConfigService
  ) {}

  /* 新註冊用戶贈送消費 */
  async addBalanceToNewUser(userId: number) {
    try {
      // TODO 直接從globalConfig中獲取配置
      const registerConfigs = await this.configEntity.find({
        where: {
          configKey: In([
            'registerSendStatus', // 開啟註冊贈送
            'registerSendModel3Count', // 註冊贈送模型3聊天次數
            'registerSendModel4Count', // 註冊贈送模型4聊天次數
            'registerSendDrawMjCount', // 註冊贈送MJ繪畫次數
            'firstRegisterSendStatus', // 開啟優先註冊贈送
            'firstRegisterSendRank', // 優先註冊贈送名次
            'firstRregisterSendModel3Count', // 優先註冊贈送模型3聊天次數
            'firstRregisterSendModel4Count', // 優先註冊贈送模型4聊天次數
            'firstRregisterSendDrawMjCount', // 優先註冊贈送MJ繪畫次數
          ]),
        },
      });
      const configMap: any = registerConfigs.reduce((pre, cur: any) => {
        const num = Number(cur.configVal);
        const n = Number.isInteger(num) && num > 0 ? num : 0;
        pre[cur.configKey] = n;
        return pre;
      }, {});
      let model3Count = 0;
      let model4Count = 0;
      let drawMjCount = 0;

      /* 開啟註冊增送 */
      if (configMap.registerSendStatus === 1) {
        model3Count = model3Count + configMap.registerSendModel3Count;
        model4Count = model4Count + configMap.registerSendModel4Count;
        drawMjCount = drawMjCount + configMap.registerSendDrawMjCount;
      }

      /* 開啟優先註冊贈送並且在贈送範圍內 */
      if (
        configMap.registerSendStatus === 1 &&
        configMap.firstRegisterSendStatus === 1 &&
        userId <= configMap.firstRegisterSendRank
      ) {
        model3Count = model3Count + configMap.firstRregisterSendModel3Count;
        model4Count = model4Count + configMap.firstRregisterSendModel4Count;
        drawMjCount = drawMjCount + configMap.firstRregisterSendDrawMjCount;
      }

      /* 受邀人註冊贈送日誌 */
      await this.saveRecordRechargeLog({
        userId,
        rechargeType: RechargeType.REG_GIFT,
        model3Count,
        drawMjCount,
        model4Count,
      });
      /* 受邀人初次註冊 一次領取所有額度 */
      await this.userBalanceEntity.save({
        userId,
        model3Count,
        model4Count,
        drawMjCount,
        useTokens: 0,
      });
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        '註冊贈送失敗,請聯繫管理員！',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 檢查餘額 */
  async validateBalance(req, type, amount) {
    const { id: userId, role } = req.user;
    let b = await this.userBalanceEntity.findOne({ where: { userId } });
    if (!b) {
      b = await this.createBaseUserBalance(userId);
    }
    if (role === 'visitor') {
      return this.validateVisitorBalance(req, type, amount);
    }
    /* 會員扣費key */
    const memberKey =
      type === 1
        ? 'memberModel3Count'
        : type === 2
        ? 'memberModel4Count'
        : type === 3
        ? 'memberDrawMjCount'
        : null;
    /* 非會員扣費key */
    const baseKey =
      type === 1
        ? 'model3Count'
        : type === 2
        ? 'model4Count'
        : type === 3
        ? 'drawMjCount'
        : null;

    // 打印到日誌
    // Logger.debug(`操作類型type: ${type}`, 'ValidateBalance');
    // Logger.debug(`會員扣費key(memberKey): ${memberKey}`, 'ValidateBalance');
    // Logger.debug(`非會員扣費key(baseKey): ${baseKey}`, 'ValidateBalance');
    /* 如果是會員 */
    if (b.packageId && b[memberKey] + b[baseKey] < amount) {
      if (b[baseKey] < amount) {
        throw new HttpException(
          `積分不足，繼續體驗服務，請按需選購套餐！`,
          HttpStatus.PAYMENT_REQUIRED
        );
      }
    }
    /* 如果不是會員 */
    if (!b.packageId && b[baseKey] < amount) {
      throw new HttpException(
        `積分不足，繼續體驗服務，請按需選購套餐！`,
        HttpStatus.PAYMENT_REQUIRED
      );
    }
    return b;
  }

  /* 檢查遊客的餘額 */
  async validateVisitorBalance(req, type, amount) {
    const { id } = req.user;
    const baseKey =
      type === 1
        ? 'model3Count'
        : type === 2
        ? 'model4Count'
        : type === 3
        ? 'drawMjCount'
        : null;
    const now = new Date();
    const log = await this.fingerprintLogEntity.findOne({
      where: { fingerprint: id },
    });
    /* 判斷餘額 */
    const { visitorModel3Num, visitorModel4Num, visitorMJNum } =
      await this.globalConfigService.getConfigs([
        'visitorModel3Num',
        'visitorModel4Num',
        'visitorMJNum',
      ]);
    const settings = {
      model3Count: visitorModel3Num ? Number(visitorModel3Num) : 0,
      model4Count: visitorModel4Num ? Number(visitorModel4Num) : 0,
      drawMjCount: visitorMJNum ? Number(visitorMJNum) : 0,
    };
    /* 如果沒有 */
    if (!log) {
      let data = {
        fingerprint: id,
        model3Count: 0,
        model4Count: 0,
        drawMjCount: 0,
      };
      data[baseKey] = data[baseKey] + amount;
      /* 判斷餘額 */
      if (data[baseKey] > settings[baseKey]) {
        throw new HttpException(
          `今日體驗額度使用完畢，請註冊使用完整服務！`,
          HttpStatus.PAYMENT_REQUIRED
        );
      } else {
        await this.fingerprintLogEntity.save(data);
        return true;
      }
    } else {
      const { model3Count, model4Count, drawMjCount } = log;
      let data = {
        model3Count,
        model4Count,
        drawMjCount,
      };
      /* 判斷是否是昨天 */
      // const isUpdateLastDay = this.isUpdatedToday(log.updatedAt)
      // const date = Number(new Date(log.updatedAt)) + 8 * 60 * 60 * 1000
      const date = Number(new Date(log.updatedAt));
      const isUpdateLastDay = this.isUpdatedToday(date);
      if (isUpdateLastDay) {
        data[baseKey] = data[baseKey] + amount;
      } else {
        data = {
          model3Count: 0,
          model4Count: 0,
          drawMjCount: 0,
        };
        data[baseKey] = data[baseKey] + amount;
      }
      if (data[baseKey] > settings[baseKey]) {
        throw new HttpException(
          `今日體驗額度使用完畢，請註冊使用完整服務！`,
          HttpStatus.PAYMENT_REQUIRED
        );
      } else {
        await this.fingerprintLogEntity.update({ fingerprint: id }, data);
        return true;
      }
    }
  }

  /* 判讀上次更新是不是今天  */
  isUpdatedToday(date) {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return date >= todayStart;
  }

  async deductFromBalance(userId, deductionType, amount, UseAmount = 0) {
    // 從數據庫中查找特定用戶的賬戶餘額記錄
    const b = await this.userBalanceEntity.findOne({ where: { userId } });

    // 如果沒有找到用戶賬戶記錄，則拋出異常
    if (!b) {
      throw new HttpException('缺失當前用戶賬戶記錄！', HttpStatus.BAD_REQUEST);
    }

    // 確定會員和非會員賬戶的 keys
    const keys = {
      1: {
        member: 'memberModel3Count',
        nonMember: 'model3Count',
        token: 'useModel3Token',
      },
      2: {
        member: 'memberModel4Count',
        nonMember: 'model4Count',
        token: 'useModel4Token',
      },
      3: {
        member: 'memberDrawMjCount',
        nonMember: 'drawMjCount',
        token: 'useDrawMjToken',
      },
    };
    const { member, nonMember, token } = keys[deductionType];

    // 計算需要扣除的餘額
    let remainingAmount = amount;
    let newMemberBalance = Math.max(b[member] - remainingAmount, 0);
    remainingAmount -= b[member] - newMemberBalance;
    let newNonMemberBalance = b[nonMember];
    if (remainingAmount > 0) {
      newNonMemberBalance = Math.max(b[nonMember] - remainingAmount, 0);
      remainingAmount -= b[nonMember] - newNonMemberBalance;
    }

    // 更新餘額對象
    const updateBalance = {
      [member]: newMemberBalance,
      [nonMember]: newNonMemberBalance,
      [token]: (b[token] || 0) + UseAmount,
    };

    // 特定類型的額外處理（如記錄使用次數）
    if (token === 'useModel3Token' || token === 'useModel4Token') {
      updateBalance[token.replace('Token', 'Count')] =
        (b[token.replace('Token', 'Count')] || 0) + amount;
    }

    // 更新數據庫中的用戶賬戶餘額
    const result = await this.userBalanceEntity.update(
      { userId },
      updateBalance
    );

    // 如果沒有記錄被更新，則拋出異常
    if (result.affected === 0) {
      throw new HttpException('消費餘額失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 查詢用戶餘額 */
  async queryUserBalance(userId: number) {
    try {
      const res: any = await this.userBalanceEntity.findOne({
        where: { userId },
        select: [
          'packageId',
          'model3Count',
          'model4Count',
          'drawMjCount',
          'memberModel3Count',
          'memberModel4Count',
          'memberDrawMjCount',
          'useModel3Count',
          'useModel4Count',
          'useModel3Token',
          'useModel4Token',
          'useDrawMjToken',
          'expirationTime',
        ],
      });
      if (!res) {
        const user = await this.createBaseUserBalance(userId);
        if (user) {
          return await this.queryUserBalance(userId);
        } else {
          throw new HttpException(
            '查詢當前用戶餘額失敗！',
            HttpStatus.BAD_REQUEST
          );
        }
      }
      res.sumModel3Count = res.packageId
        ? res.model3Count + res.memberModel3Count
        : res.model3Count;
      res.sumModel4Count = res.packageId
        ? res.model4Count + res.memberModel4Count
        : res.model4Count;
      res.sumDrawMjCount = res.packageId
        ? res.drawMjCount + res.memberDrawMjCount
        : res.drawMjCount;
      res.expirationTime = res.expirationTime
        ? formatDate(res.expirationTime, 'YYYY-MM-DD')
        : null;
      return res;
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /* 記錄充值日誌 */
  async saveRecordRechargeLog(logInfo: LogInfo) {
    const {
      userId,
      rechargeType,
      model3Count,
      model4Count,
      drawMjCount,
      days = -1,
      pkgName = '',
      extent = '',
    } = logInfo;
    if (!userId) {
      throw new HttpException(
        '當前用戶不存在,記錄充值日誌異常',
        HttpStatus.BAD_REQUEST
      );
    }
    const uid = createRandomUid();
    return await this.accountLogEntity.save({
      userId,
      rechargeType,
      model3Count,
      model4Count,
      drawMjCount,
      days,
      extent,
      uid,
      pkgName,
    });
  }

  /* 創建一條基礎的用戶餘額記錄 */
  async createBaseUserBalance(
    userId: number,
    userBalanceInfo: UserBalanceInfo = {}
  ) {
    const {
      model3Count = 0,
      model4Count = 0,
      drawMjCount = 0,
    } = userBalanceInfo;
    const balance = await this.userBalanceEntity.findOne({ where: { userId } });
    if (balance) {
      throw new HttpException(
        '當前用戶無需創建賬戶資訊！',
        HttpStatus.BAD_REQUEST
      );
    }
    return await this.userBalanceEntity.save({
      userId,
      model3Count,
      model4Count,
      drawMjCount,
    });
  }

  /* 給用戶增加固定次數額度 */
  async addBalanceToUser(userId, balance, days = -1) {
    try {
      const userBalanceInfo =
        (await this.userBalanceEntity.findOne({ where: { userId } })) ||
        (await this.createBaseUserBalance(userId));
      if (!userBalanceInfo) {
        throw new HttpException(
          '查詢用戶賬戶資訊失敗！',
          HttpStatus.BAD_REQUEST
        );
      }
      const {
        model3Count,
        model4Count,
        drawMjCount,
        memberModel3Count,
        memberModel4Count,
        memberDrawMjCount,
      } = userBalanceInfo;
      let params = {};
      /* 是否充值會員套餐 大於0的時間天數都屬於套餐 */
      if (days > 0) {
        const { packageId } = balance;
        if (!packageId) {
          throw new HttpException(
            '缺失當前套餐ID、充值失敗！',
            HttpStatus.BAD_REQUEST
          );
        }
        const pkgInfo = await this.cramiPackageEntity.findOne({
          where: { id: packageId },
        });
        if (!pkgInfo) {
          throw new HttpException('當前套餐不存在！', HttpStatus.BAD_REQUEST);
        }
        const { weight } = pkgInfo; // 套餐的權重 = 會員等級
        /* 如果不是會員那麼則直接充值進入並修改會員資訊為會員身份 */
        if (!userBalanceInfo.packageId) {
          params = {
            memberModel3Count: memberModel3Count + balance.model3Count,
            memberModel4Count: memberModel4Count + balance.model4Count,
            memberDrawMjCount: memberDrawMjCount + balance.drawMjCount,
            expirationTime: dayjs()
              .add(days > 0 ? days : 0, 'day')
              .format('YYYY-MM-DD HH:mm:ss'),
            packageId: packageId,
          };
        } else {
          /* 我當前使用的套餐資訊 */
          const curPackageInfo = await this.cramiPackageEntity.findOne({
            where: { id: userBalanceInfo.packageId },
          });
          /* 如果是會員則  充值更高或當前等級的套餐會進行時間覆蓋充值餘額疊加  充值低等級套餐只會疊加次數 不更新到期時間 */
          /* pkgLevel： 我當前的套餐等級 weight： 充值套餐的等級高於或等於當前套餐 則疊加時間併合並額度 */
          if (weight >= curPackageInfo.weight) {
            params = {
              memberModel3Count: memberModel3Count + balance.model3Count,
              memberModel4Count: memberModel4Count + balance.model4Count,
              memberDrawMjCount: memberDrawMjCount + balance.drawMjCount,
              expirationTime: dayjs(userBalanceInfo.expirationTime)
                .add(days > 0 ? days : 0, 'day')
                .format('YYYY-MM-DD HH:mm:ss'),
              packageId: packageId,
            };
          }
          /* 如果充值套餐小於當前套餐等級 只疊加次數 不延長時間 也不變更會員等級 */
          if (weight < curPackageInfo.weight) {
            params = {
              memberModel3Count: memberModel3Count + balance.model3Count,
              memberModel4Count: memberModel4Count + balance.model4Count,
              memberDrawMjCount: memberDrawMjCount + balance.drawMjCount,
            };
          }
        }
      }
      /* 充值不限時卡直接疊加 */
      if (days <= 0) {
        params = {
          model3Count: model3Count + balance.model3Count,
          model4Count: model4Count + balance.model4Count,
          drawMjCount: drawMjCount + balance.drawMjCount,
        };
      }
      const result = await this.userBalanceEntity.update({ userId }, params);
      if (result.affected === 0) {
        throw new HttpException(`${userId}充值失敗`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('用戶充值失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 支付成功給用戶充值套餐 */
  async addBalanceToOrder(order) {
    console.log('充值的工單資訊:', order);
    try {
      const { userId, goodsId } = order;
      const pkg = await this.cramiPackageEntity.findOne({
        where: { id: order.goodsId, status: 1 },
      });
      if (!pkg) {
        throw new HttpException(
          '非法操作、當前充值套餐暫不存在！',
          HttpStatus.BAD_REQUEST
        );
      }
      const {
        model3Count,
        model4Count,
        drawMjCount,
        days,
        name: pkgName,
      } = pkg;
      const money = {
        model3Count,
        model4Count,
        drawMjCount,
        days,
        packageId: order.goodsId,
      };
      /* 充值進賬戶 */
      await this.addBalanceToUser(userId, money, days);
      /* 記錄充值日誌 */
      await this.saveRecordRechargeLog({
        userId,
        rechargeType: RechargeType.SCAN_PAY,
        model3Count,
        model4Count,
        drawMjCount,
        pkgName,
        days,
      });
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('充值失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 查詢用戶充值日誌 */
  async getRechargeLog(req: Request, params) {
    const { page = 1, size = 20 } = params;
    const { id } = req.user;
    const [rows, count] = await this.accountLogEntity.findAndCount({
      where: { userId: id },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    rows.forEach((item: any) => {
      item.expireDateCn = item.days > 0 ? `${item.days}天` : '永久';
      // item.expireDateCn = item.days > 0 ? `${item.days} Days` : 'Permanent';
    });
    return { rows: formatCreateOrUpdateDate(rows), count };
  }

  /* 管理端查詢用戶賬戶變更記錄 */
  async getAccountLog(req, params) {
    try {
      const { page = 1, size = 10, userId, rechargeType, packageId } = params;
      const { role } = req.user;
      const where: any = {};
      rechargeType && (where.rechargeType = rechargeType);
      where.userId = userId || LessThan(100000);
      packageId && (where.packageId = { $like: `%${packageId}%` });
      const [rows, count] = await this.accountLogEntity.findAndCount({
        where,
        order: { id: 'DESC' },
        skip: (page - 1) * size,
        take: size,
      });
      const userIds = rows.map((item: any) => item.userId);
      const userInfo = await this.userEntity.find({
        where: { id: In(userIds) },
      });
      rows.forEach((item: any) => {
        const user = userInfo.find((user: any) => user.id === item.userId);
        item.username = user?.username;
        item.email = user?.email;
        item.phone = user?.phone;
        item.status = user?.status;
        item.avatar = user?.avatar;
      });
      if (role !== 'super') {
        rows.forEach((item: any) => {
          item.email = item.email ? hideString(item.email) : '';
          item.phone = item.phone ? hideString(item.phone) : '';
        });
      }
      return { rows, count };
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('查詢用戶賬戶失敗！', HttpStatus.BAD_REQUEST);
    }
  }

  /* 通過用戶id批量查詢用戶 */
  async queryUserBalanceByIds(ids: number[]) {
    return await this.userBalanceEntity.find({ where: { userId: In(ids) } });
  }

  /* MJ繪畫失敗退款 */
  async refundMjBalance(userId, amount) {
    return await this.deductFromBalance(userId, 'mjDraw', -amount);
  }

  async inheritVisitorData(req: Request) {
    const { fingerprint } = req.headers;
    const { id: userId } = req.user;
    await this.chatLogEntity.update(
      { userId: Number(fingerprint) },
      { userId }
    );
    await this.chatGroupEntity.update(
      { userId: Number(fingerprint) },
      { userId }
    );
    return 1;
  }

  async getVisitorCount(req) {
    const { fingerprint } = req.headers;
    const countChat = await this.chatLogEntity.count({
      where: { userId: fingerprint },
    });
    const countChatGroup = await this.chatGroupEntity.count({
      where: { userId: fingerprint },
    });

    return countChat || countChatGroup || 0;
  }

  /**
   * 檢查用戶是否需要進行認證
   * @param userId 用戶ID
   */
  async checkUserCertification(userId: number): Promise<void> {
    const userInfo = await this.userEntity.findOne({
      where: { id: userId },
    });
    const userBalance = await this.userBalanceEntity.findOne({
      where: { userId },
    });

    if (!userInfo || !userBalance) {
      return;
      // throw new HttpException(
      //   '用戶資訊或用戶餘額資訊不存在',
      //   HttpStatus.NOT_FOUND
      // );
    }

    // 獲取配置項
    const {
      phoneValidationMessageCount,
      identityVerificationMessageCount,
      openIdentity,
      openPhoneValidation,
    } = await this.globalConfigService.getConfigs([
      'phoneValidationMessageCount',
      'identityVerificationMessageCount',
      'openIdentity',
      'openPhoneValidation',
    ]);

    // 格式化配置項為數字類型
    const phoneValidationCount = Number(phoneValidationMessageCount);
    const identityValidationCount = Number(identityVerificationMessageCount);

    const model3Count = Number(userBalance.useModel3Count) || 0;
    const model4Count = Number(userBalance.useModel4Count) || 0;
    const totalTokens = model3Count + model4Count;

    // 檢查是否開啟手機號驗證並且是否已經綁定手機號
    if (
      openPhoneValidation === '1' &&
      totalTokens >= phoneValidationCount &&
      !userInfo.phone
    ) {
      throw new HttpException('請完成手機號綁定', HttpStatus.BAD_REQUEST);
    }

    // 檢查是否開啟實名認證並且是否已經完成實名認證
    if (
      openIdentity === '1' &&
      totalTokens >= identityValidationCount &&
      (!userInfo.realName || !userInfo.idCard)
    ) {
      throw new HttpException('請完成實名認證', HttpStatus.BAD_REQUEST);
    }

    // 如果不需要任何認證，方法直接結束，無需返回值
  }
}
