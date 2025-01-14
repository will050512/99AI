import { GlobalConfigService } from './../globalConfig/globalConfig.service';
import { UserBalanceService } from './../userBalance/userBalance.service';
import { HttpException, HttpStatus, Injectable, Logger, Global } from '@nestjs/common';
import { Request } from 'express';
import { SigninEntity } from './signIn.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from '@/common/utils/date';
import { UserEntity } from '../user/user.entity';
import { RechargeType } from '@/common/constants/balance.constant';

@Injectable()
export class SigninService {
  constructor(
    @InjectRepository(SigninEntity)
    private readonly signinEntity: Repository<SigninEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    private readonly userBalanceService: UserBalanceService,
    private readonly globalConfigService: GlobalConfigService,
  ) {}

  async sign(req: Request) {
    const { id: userId } = req.user;
    /* 使用格式化時間記錄 */
    const formattedDate = dayjs(new Date()).format('YYYY-MM-DD');
    // 查詢用戶今天的簽到記錄
    const existingSignin = await this.signinEntity.findOne({
      where: { userId, signInDate: formattedDate },
    });
    /* 今日已簽到 */
    if (existingSignin) {
      throw new HttpException('今日已簽到、改天再來吧!.', HttpStatus.BAD_REQUEST);
    }
    /* 查詢簽到贈送獎勵 並優先檢測是否開啟了贈送狀態 */
    const { model3Count, model4Count, drawMjCount } = await this.globalConfigService.getSignatureGiftConfig();

    /* 創建新的簽到記錄 */
    await this.signinEntity.save({
      userId: userId,
      signInTime: new Date(),
      signInDate: formattedDate,
      isSigned: true,
    });

    await this.userBalanceService.addBalanceToUser(userId, { model3Count, model4Count, drawMjCount });
    /* 記錄日誌 */
    await this.userBalanceService.saveRecordRechargeLog({ userId, rechargeType: RechargeType.SIGN_IN, model3Count, model4Count, drawMjCount });
    /* 判斷是否連續簽到 */
    const yesterday = dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD');
    const previousSignin = await this.signinEntity.findOne({
      where: { userId: userId, signInDate: yesterday },
    });
    /* 昨天簽到了 連續簽到 增加連續簽到日期 */
    if (previousSignin) {
      Logger.debug(`用戶${userId}昨天簽到了、今天是連續簽到！`, 'SigninService');
      const userInfo = await this.userEntity.findOne({ where: { id: userId } });
      if (!userInfo) {
        throw new HttpException('用戶不存在', HttpStatus.BAD_REQUEST);
      }
      const { consecutiveDays = 0 } = userInfo;
      await this.userEntity.update({ id: userId }, { consecutiveDays: consecutiveDays + 1 });
    } else {
      Logger.debug(`用戶${userId}昨天沒簽到、今天重置天數！`, 'SigninService');
      await this.userEntity.update({ id: userId }, { consecutiveDays: 1 });
    }

    return 'Sign in successful.';
  }

  async getSigninLog(req: Request) {
    try {
      const { id: userId } = req.user;
      const firstDay = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const lastDay = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss');
      const queryBuilder = this.signinEntity.createQueryBuilder('signin');
      const signInData = await queryBuilder
        .select('signin.signInDate as signInDate, signin.isSigned as isSigned')
        .andWhere('signin.userId = :userId', { userId: req.user.id })
        .andWhere('signin.signInTime >= :firstDay', { firstDay })
        .andWhere('signin.signInTime <= :lastDay', { lastDay })
        .getRawMany();
      const startDate = new Date(firstDay);
      const endDate = new Date(lastDay);
      const dateRange = [];
      const currentDate = new Date(startDate);
      /* 組裝最近三十天結構 */
      while (currentDate <= endDate) {
        dateRange.push(dayjs(new Date(currentDate)).format('YYYY-MM-DD'));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      const res = [];
      // 檢查每一天是否有數據，若無則添加默認數據
      for (const date of dateRange) {
        const existingData = signInData.find((item) => item.signInDate === date);
        if (!existingData) {
          res.push({ signInDate: date, isSigned: false });
        } else {
          existingData.isSigned = true;
          res.push(existingData);
        }
      }
      return res;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('獲取簽到數據失敗！', HttpStatus.BAD_REQUEST);
    }
  }
}
