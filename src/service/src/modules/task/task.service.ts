import { GlobalConfigService } from './../globalConfig/globalConfig.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserBalanceEntity } from '../userBalance/userBalance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { ModelsService } from '../models/models.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(UserBalanceEntity)
    private readonly userBalanceEntity: Repository<UserBalanceEntity>,
    private readonly globalConfigService: GlobalConfigService,
    private readonly modelsService: ModelsService,
  ) { }

  /* 每小時刷新一次微信的token */
  @Cron(CronExpression.EVERY_HOUR)
  handleCron() {
    Logger.debug('Automatically refresh WeChat access every hour Token', 'TaskService');
    this.globalConfigService.getWechatAccessToken();
  }

  /* 每兩鍾執行一次檢測會員過期任務 */
  // @Cron(CronExpression.EVERY_2_SECONDS)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUserMemerExpire() {
    const expireUsers = await this.userBalanceEntity.find({
      where: { expirationTime: LessThanOrEqual(new Date()) },
    });
    if (!expireUsers || !expireUsers.length) return;
    expireUsers.forEach((user: any) => {
      this.userBalanceEntity
        .update({ id: user.id }, { expirationTime: null, packageId: 0, memberModel3Count: 0, memberModel4Count: 0, memberDrawMjCount: 0 })
        .then((res) => {
          Logger.debug(`${user.id}會員已到期、清空所有餘額並移除會員身份！`, 'TaskService');
        });
    });
  }

  /* 每小時檢測一次授權 */
  // @Cron('0 0 */5 * *')
  // refreshBaiduAccesstoken() {
  //   this.modelsService.refreshBaiduAccesstoken();
  // }
}
