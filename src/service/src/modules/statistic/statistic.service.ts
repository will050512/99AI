import { ChatType } from '@/common/constants/balance.constant';
import { formatDate } from '@/common/utils/date';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { ChatLogEntity } from '../chatLog/chatLog.entity';
import { ConfigEntity } from '../globalConfig/config.entity';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { OrderEntity } from '../order/order.entity';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(ChatLogEntity)
    private readonly chatLogEntity: Repository<ChatLogEntity>,
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderEntity: Repository<OrderEntity>,
    private readonly globalConfigService: GlobalConfigService
  ) {}

  /* 基礎數據統計 */
  async getBaseStatistic() {
    const userCount = await this.countUsers();
    const newUserCount = await this.countNewUsersToday();
    const chatCount = await this.countChats();
    const newChatCount = await this.countNewChatsToday();
    const drawCount = await this.countDraws();
    const dellDrawCount = await this.countNewDrawsToday();
    const orderCount = await this.countOrders();
    const newOrderCount = await this.countNewOrdersToday();
    return {
      userCount,
      newUserCount,
      chatCount,
      newChatCount,
      drawCount,
      newDrawCount: dellDrawCount,
      orderCount,
      newOrderCount,
    };
  }

  /* 聊天記錄統計 */
  async getChatStatistic({ days = 7 }) {
    const chatData = await this.countChatsByTimeRange(days);
    const drawData = await this.countDrawsByTimeRange(days);
    return {
      date: chatData.map((item) => item.date),
      chat: chatData.map((item: any) => item.value),
      draw: drawData.map((item: any, index) => {
        return item.value;
      }),
    };
  }

  /* 查詢百度統計數據 */
  async getBaiduVisit({ days = 7 }) {
    const data = await this.getBaiduStatistics(days);
    return data;
  }

  /* 查詢用戶總數 */
  async countUsers(): Promise<number> {
    const userCount = await this.userEntity.count();
    return userCount;
  }

  /* 當天新增用戶 */
  async countNewUsersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const queryBuilder = this.userEntity.createQueryBuilder('user');
    const userCount = await queryBuilder
      .where('user.createdAt >= :today', { today })
      .andWhere('user.createdAt < :tomorrow', { tomorrow })
      .getCount();
    return userCount;
  }

  /* 聊天次數總數 */
  async countChats(): Promise<number> {
    const chatCount = await this.chatLogEntity.count({
      where: { type: ChatType.NORMAL_CHAT },
    });
    return chatCount;
  }

  /* 當日聊天新增次數 */
  async countNewChatsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const queryBuilder = this.chatLogEntity.createQueryBuilder('chatLog');
    const chatCount = await queryBuilder
      .where('chatLog.type = :type', { type: ChatType.NORMAL_CHAT })
      .andWhere('chatLog.createdAt >= :today', { today })
      .andWhere('chatLog.createdAt < :tomorrow', { tomorrow })
      .getCount();
    return chatCount;
  }

  /* 繪畫次數總數 */
  async countDraws(): Promise<number> {
    const drawCount = await this.chatLogEntity.count({
      where: { type: ChatType.PAINT },
    });
    return drawCount;
  }

  /* 當日新增繪畫次數 */
  async countNewDrawsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const queryBuilder = this.chatLogEntity.createQueryBuilder('chatLog');
    const drawCount = await queryBuilder
      .where('chatLog.type = :type', { type: ChatType.PAINT })
      .andWhere('chatLog.createdAt >= :today', { today })
      .andWhere('chatLog.createdAt < :tomorrow', { tomorrow })
      .getCount();
    return drawCount;
  }

  /* 統計一段時間內的聊天數據 */
  async countChatsByTimeRange(
    days: number
  ): Promise<{ date: string; count: number }[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(
      today.getTime() - (days - 1) * 24 * 60 * 60 * 1000
    );
    const queryBuilder = this.chatLogEntity.createQueryBuilder('chatlog');
    const result = await queryBuilder
      .select(`DATE(chatlog.createdAt) as date, COUNT(*) as count`)
      .where(`chatlog.type = :type`, { type: ChatType.NORMAL_CHAT })
      .andWhere('chatlog.createdAt >= :startDate', { startDate })
      .groupBy('date')
      .orderBy('date')
      .getRawMany<{ date: string; count: number }>();
    const dailyData = [];
    const currentDate = startDate;
    for (let i = 0; i < days; i++) {
      const dateString = formatDate(new Date(currentDate), 'M.DD');
      const count =
        result.find(
          (r: any) => formatDate(new Date(r.date), 'M.DD') === dateString
        )?.count ?? 0;
      if (count > 0) {
        dailyData.push({ date: dateString, value: Number(count) });
      } else {
        dailyData.push({ date: dateString, value: 0 });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dailyData;
  }

  /* 統計一段時間內的繪畫次數 */
  async countDrawsByTimeRange(
    days: number
  ): Promise<{ date: string; count: number }[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(
      today.getTime() - (days - 1) * 24 * 60 * 60 * 1000
    );
    const queryBuilder = this.chatLogEntity.createQueryBuilder('chatlog');
    const result = await queryBuilder
      .select(`DATE(chatlog.createdAt) as date, COUNT(*) as count`)
      .where(`chatlog.type = :type`, { type: ChatType.PAINT })
      .andWhere('chatlog.createdAt >= :startDate', { startDate })
      .groupBy('date')
      .orderBy('date')
      .getRawMany<{ date: string; count: number }>();
    const dailyData = [];
    const currentDate = startDate;
    for (let i = 0; i < days; i++) {
      const dateString = formatDate(new Date(currentDate), 'M.DD');
      const count =
        result.find(
          (r: any) => formatDate(new Date(r.date), 'M.DD') === dateString
        )?.count ?? 0;
      if (count > 0) {
        dailyData.push({ date: dateString, value: Number(count) });
      } else {
        dailyData.push({ date: dateString, value: 0 });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dailyData;
  }

  async getNewAccessToken(
    baiduApiKey: string,
    baiduSecretKey: string,
    baiduRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenUrl = `http://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token=${baiduRefreshToken}&client_id=${baiduApiKey}&client_secret=${baiduSecretKey}`;
    Logger.log('獲取新 accessToken', tokenUrl);

    try {
      const tokenRes = await axios.get(tokenUrl);
      if (tokenRes.status === 200 && tokenRes.data.access_token) {
        return {
          accessToken: tokenRes.data.access_token,
          refreshToken: tokenRes.data.refresh_token,
        };
      } else {
        throw new Error('Failed to get new access token');
      }
    } catch (tokenError) {
      Logger.error('獲取新 accessToken 失敗', {
        message: tokenError.message,
        stack: tokenError.stack,
        response: tokenError.response
          ? tokenError.response.data
          : 'No response data',
      });
      throw new HttpException(
        '獲取新 accessToken 失敗',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateAccessTokenInDatabase(
    accessToken: string,
    refreshToken: string,
    configEntity: any
  ) {
    await configEntity.update(
      { configKey: 'baiduToken' },
      { configVal: accessToken }
    );
    await configEntity.update(
      { configKey: 'baiduRefreshToken' },
      { configVal: refreshToken }
    );
  }

  async getBaiduStatistics(
    days: number
  ): Promise<{ date: string; count: number }[]> {
    const end_date = formatDate(new Date(), 'YYYYMMDD');
    const start_date = formatDate(
      new Date(Date.now() - Number(days - 1) * 24 * 60 * 60 * 1000),
      'YYYYMMDD'
    );
    const metrics =
      'pv_count,visitor_count,ip_count,bounce_ratio,avg_visit_time';
    const method = 'overview/getTimeTrendRpt';

    const {
      baiduToken,
      baiduSiteId,
      baiduApiKey,
      baiduSecretKey,
      baiduRefreshToken,
    } = await this.globalConfigService.getConfigs([
      'baiduToken',
      'baiduSiteId',
      'baiduApiKey',
      'baiduSecretKey',
      'baiduRefreshToken',
    ]);

    if (!baiduApiKey || !baiduSiteId || !baiduRefreshToken || !baiduSecretKey) {
      return [];
    }

    let accessToken = baiduToken;
    let res;
    let url;

    const fetchData = async (token: string) => {
      url = `https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=${token}&site_id=${baiduSiteId}&method=${method}&start_date=${start_date}&end_date=${end_date}&metrics=${metrics}`;
      try {
        return await axios.get(url);
      } catch (error) {
        return {
          data: {
            error_code: 111,
            message: 'Access token invalid or no longer valid',
          },
        };
      }
    };

    res = await fetchData(accessToken);

    if (res.data.error_code === 111 || !baiduToken) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.getNewAccessToken(
          baiduApiKey,
          baiduSecretKey,
          baiduRefreshToken
        );
      accessToken = newAccessToken;
      await this.updateAccessTokenInDatabase(
        accessToken,
        newRefreshToken,
        this.configEntity
      );
      res = await fetchData(accessToken);
    }

    const { error_code, message } = res.data;

    if (error_code && error_code !== 200) {
      throw new HttpException(
        message || '獲取百度統計數據失敗',
        HttpStatus.BAD_REQUEST
      );
    }

    // 格式化數據
    return res.data.result;
  }

  /* 訂單總次數  */
  async countOrders(): Promise<number> {
    const orderCount = await this.orderEntity.count();
    return orderCount;
  }

  /* 今日新增訂單 */
  async countNewOrdersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const queryBuilder = this.orderEntity.createQueryBuilder('order');
    const orderCount = await queryBuilder
      .where('order.createdAt >= :today', { today })
      .andWhere('order.createdAt < :tomorrow', { tomorrow })
      .getCount();
    return orderCount;
  }
}
