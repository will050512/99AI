import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { In, IsNull, Like, MoreThan, Not, Repository } from 'typeorm';
import { AppEntity } from './app.entity';
import { AppCatsEntity } from './appCats.entity';
import { CollectAppDto } from './dto/collectApp.dto';
import { CreateAppDto } from './dto/createApp.dto';
import { CreateCatsDto } from './dto/createCats.dto';
import { OperateAppDto } from './dto/deleteApp.dto';
import { DeleteCatsDto } from './dto/deleteCats.dto';
import { QuerAppDto } from './dto/queryApp.dto';
import { QuerCatsDto } from './dto/queryCats.dto';
import { UpdateAppDto } from './dto/updateApp.dto';
import { UpdateCatsDto } from './dto/updateCats.dto';
import { UserAppsEntity } from './userApps.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppCatsEntity)
    private readonly appCatsEntity: Repository<AppCatsEntity>,
    @InjectRepository(AppEntity)
    private readonly appEntity: Repository<AppEntity>,
    @InjectRepository(UserAppsEntity)
    private readonly userAppsEntity: Repository<UserAppsEntity>
  ) {}

  async createAppCat(body: CreateCatsDto) {
    const { name } = body;
    const c = await this.appCatsEntity.findOne({ where: { name } });
    if (c) {
      throw new HttpException('該分類名稱已存在！', HttpStatus.BAD_REQUEST);
    }
    return await this.appCatsEntity.save(body);
  }

  async delAppCat(body: DeleteCatsDto) {
    const { id } = body;
    const c = await this.appCatsEntity.findOne({ where: { id } });
    if (!c) {
      throw new HttpException('該分類不存在！', HttpStatus.BAD_REQUEST);
    }
    const count = await this.appEntity.count({ where: { catId: id } });
    if (count > 0) {
      throw new HttpException(
        '該分類下存在App，不可刪除！',
        HttpStatus.BAD_REQUEST
      );
    }
    const res = await this.appCatsEntity.delete(id);
    if (res.affected > 0) return '刪除成功';
    throw new HttpException('刪除失敗！', HttpStatus.BAD_REQUEST);
  }

  async updateAppCats(body: UpdateCatsDto) {
    const { id, name } = body;
    const c = await this.appCatsEntity.findOne({
      where: { name, id: Not(id) },
    });
    if (c) {
      throw new HttpException('該分類名稱已存在！', HttpStatus.BAD_REQUEST);
    }
    const res = await this.appCatsEntity.update({ id }, body);
    if (res.affected > 0) return '修改成功';
    throw new HttpException('修改失敗！', HttpStatus.BAD_REQUEST);
  }

  async queryOneCat(params) {
    const { id } = params;
    if (!id) {
      throw new HttpException('缺失必要參數！', HttpStatus.BAD_REQUEST);
    }
    const app = await this.appEntity.findOne({ where: { id } });
    // console.log(`查詢App詳情成功:`, app);
    const {
      demoData: demo,
      coverImg,
      des,
      name,
      isFixedModel,
      isGPTs,
      appModel,
    } = app;
    return {
      demoData: demo ? demo.split('\n') : [],
      coverImg,
      des,
      name,
      isGPTs,
      isFixedModel,
      appModel,
    };
  }

  async appCatsList(query: QuerCatsDto) {
    const { page = 1, size = 10, name, status } = query;
    const where: any = {};
    name && (where.name = Like(`%${name}%`));
    [0, 1, '0', '1'].includes(status) && (where.status = status);
    const [rows, count] = await this.appCatsEntity.findAndCount({
      where,
      order: { order: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    // 查出所有分類下對應的App數量
    const catIds = rows.map((item) => item.id);
    const apps = await this.appEntity.find({ where: { catId: In(catIds) } });
    const appCountMap = {};
    apps.forEach((item) => {
      if (appCountMap[item.catId]) {
        appCountMap[item.catId] += 1;
      } else {
        appCountMap[item.catId] = 1;
      }
    });
    rows.forEach((item: any) => (item.appCount = appCountMap[item.id] || 0));
    return { rows, count };
  }

  async appList(req: Request, query: QuerAppDto, orderKey = 'id') {
    const { page = 1, size = 10, name, status, catId, role } = query;
    const where: any = { isSystemReserved: 0 };
    name && (where.name = Like(`%${name}%`));
    catId && (where.catId = catId);
    role && (where.role = role);
    status && (where.status = status);
    const [rows, count] = await this.appEntity.findAndCount({
      where,
      order: { [orderKey]: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    const catIds = rows.map((item) => item.catId);
    const cats = await this.appCatsEntity.find({ where: { id: In(catIds) } });
    rows.forEach((item: any) => {
      const cat = cats.find((c) => c.id === item.catId);
      item.catName = cat ? cat.name : '';
    });
    if (req?.user?.role !== 'super') {
      rows.forEach((item: any) => {
        delete item.preset;
      });
    }
    return { rows, count };
  }

  async frontAppList(req: Request, query: QuerAppDto, orderKey = 'id') {
    const { page = 1, size = 1000, name, catId, role } = query;
    const where: any = [
      {
        status: In([1, 4]),
        userId: IsNull(),
        public: false,
        isSystemReserved: 0,
      },
      { userId: MoreThan(0), public: true },
    ];
    const [rows, count] = await this.appEntity.findAndCount({
      where,
      order: { order: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    const catIds = rows.map((item) => item.catId);
    const cats = await this.appCatsEntity.find({ where: { id: In(catIds) } });
    rows.forEach((item: any) => {
      const cat = cats.find((c) => c.id === item.catId);
      item.catName = cat ? cat.name : '';
    });
    if (req?.user?.role !== 'super') {
      rows.forEach((item: any) => {
        delete item.preset;
      });
    }
    return { rows, count };
  }

  async searchAppList(body: any) {
    console.log('搜索App列表', body);
    const { page = 1, size = 1000, keyword } = body;
    console.log(`搜索關鍵詞：${keyword}`);

    // 基礎查詢條件，可以根據實際情況調整
    let baseWhere: any = [
      {
        status: In([1, 4]),
        userId: IsNull(),
        public: false,
        isSystemReserved: 0,
      },
      { userId: MoreThan(0), public: true },
    ];

    console.log('初始查詢條件：', JSON.stringify(baseWhere));

    // 如果存在關鍵字，修改查詢條件以同時搜索 name 和 description
    if (keyword) {
      baseWhere = baseWhere.map((condition) => ({
        ...condition,
        name: Like(`%${keyword}%`),
      }));
      console.log('更新後的查詢條件：', JSON.stringify(baseWhere));
    }
    try {
      const [rows, count] = await this.appEntity.findAndCount({
        where: baseWhere,
        skip: (page - 1) * size,
        take: size,
      });
      console.log(`查詢返回 ${count} 條結果，顯示第 ${page} 頁的結果。`);

      rows.forEach((item: any) => {
        delete item.preset; // 假設preset是不需要返回給前端的敏感資訊
      });

      console.log('完成查詢，準備返回結果');
      return { rows, count };
    } catch (error) {
      console.error('查詢數據庫時出錯：', error);
      throw new Error('Database query failed');
    }
  }

  async createApp(body: CreateAppDto) {
    const { name, catId } = body;
    body.role = 'system';
    const a = await this.appEntity.findOne({ where: { name } });
    if (a) {
      throw new HttpException('該應用名稱已存在！', HttpStatus.BAD_REQUEST);
    }
    const c = await this.appCatsEntity.findOne({ where: { id: catId } });
    if (!c) {
      throw new HttpException('該分類不存在！', HttpStatus.BAD_REQUEST);
    }
    return await this.appEntity.save(body);
  }

  async updateApp(body: UpdateAppDto) {
    const { id, name, catId, status } = body;
    const a = await this.appEntity.findOne({ where: { name, id: Not(id) } });
    if (a) {
      throw new HttpException('該應用名稱已存在！', HttpStatus.BAD_REQUEST);
    }
    const c = await this.appCatsEntity.findOne({ where: { id: catId } });
    if (!c) {
      throw new HttpException('該分類不存在！', HttpStatus.BAD_REQUEST);
    }
    const curApp = await this.appEntity.findOne({ where: { id } });
    if (curApp.status !== body.status) {
      await this.userAppsEntity.update({ appId: id }, { status });
    }
    const res = await this.appEntity.update({ id }, body);
    if (res.affected > 0) return '修改App資訊成功';
    throw new HttpException('修改App資訊失敗！', HttpStatus.BAD_REQUEST);
  }

  async delApp(body: OperateAppDto) {
    const { id } = body;
    const a = await this.appEntity.findOne({ where: { id } });
    if (!a) {
      throw new HttpException('該應用不存在！', HttpStatus.BAD_REQUEST);
    }
    const useApp = await this.userAppsEntity.count({ where: { appId: id } });
    // if (useApp > 0) {
    //   throw new HttpException(
    //     '該應用已被用戶關聯使用中，不可刪除！',
    //     HttpStatus.BAD_REQUEST
    //   );
    // }
    const res = await this.appEntity.delete(id);
    if (res.affected > 0) return '刪除App成功';
    throw new HttpException('刪除App失敗！', HttpStatus.BAD_REQUEST);
  }

  async auditPass(body: OperateAppDto) {
    const { id } = body;
    const a = await this.appEntity.findOne({ where: { id, status: 3 } });
    if (!a) {
      throw new HttpException('該應用不存在！', HttpStatus.BAD_REQUEST);
    }
    await this.appEntity.update({ id }, { status: 4 });
    /* 同步變更useApp status  */
    await this.userAppsEntity.update({ appId: id }, { status: 4 });
    return '應用審核通過';
  }

  async auditFail(body: OperateAppDto) {
    const { id } = body;
    const a = await this.appEntity.findOne({ where: { id, status: 3 } });
    if (!a) {
      throw new HttpException('該應用不存在！', HttpStatus.BAD_REQUEST);
    }
    await this.appEntity.update({ id }, { status: 5 });
    /* 同步變更useApp status  */
    await this.userAppsEntity.update({ appId: id }, { status: 5 });
    return '應用審核拒絕完成';
  }

  async collect(body: CollectAppDto, req: Request) {
    const { appId } = body;
    const { id: userId } = req.user;
    const historyApp = await this.userAppsEntity.findOne({
      where: { appId, userId },
    });
    if (historyApp) {
      const r = await this.userAppsEntity.delete({ appId, userId });
      if (r.affected > 0) {
        return '取消收藏成功!';
      } else {
        throw new HttpException('取消收藏失敗！', HttpStatus.BAD_REQUEST);
      }
    }
    const app = await this.appEntity.findOne({ where: { id: appId } });
    const { id, role: appRole, catId } = app;
    const collectInfo = {
      userId,
      appId: id,
      catId,
      appRole,
      public: true,
      status: 1,
    };
    await this.userAppsEntity.save(collectInfo);
    return '已將應用加入到我的收藏！';
  }

  // async mineApps(req: Request, query = { page: 1, size: 30 }) {
  //   const { id } = req.user;
  //   const { page = 1, size = 30 } = query;
  //   const [rows, count] = await this.userAppsEntity.findAndCount({
  //     where: { userId: id, status: In([1, 3, 4, 5]) },
  //     order: { id: 'DESC' },
  //     skip: (page - 1) * size,
  //     take: size,
  //   });

  //   const appIds = rows.map((item) => item.appId);
  //   const appsInfo = await this.appEntity.find({ where: { id: In(appIds) } });
  //   rows.forEach((item: any) => {
  //     const app = appsInfo.find((c) => c.id === item.appId);
  //     item.appName = app ? app.name : '';
  //     item.appRole = app ? app.role : '';
  //     item.appDes = app ? app.des : '';
  //     item.coverImg = app ? app.coverImg : '';
  //     item.demoData = app ? app.demoData : '';
  //     item.preset = app.userId === id ? app.preset : '******';
  //   });
  //   return { rows, count };
  // }

  async mineApps(req: Request, query = { page: 1, size: 30 }) {
    // 記錄函數調用時間和查詢參數
    // console.log(`mineApps 在 ${new Date().toISOString()} 被調用，查詢參數為：`, query);

    const { id } = req.user;
    // console.log(`正在處理用戶ID: ${id} 的mineApps請求`); // 記錄處理的用戶ID

    const { page = 1, size = 30 } = query;
    let rows, count;

    try {
      [rows, count] = await this.userAppsEntity.findAndCount({
        where: { userId: id, status: In([1, 3, 4, 5]) },
        order: { id: 'DESC' },
        skip: (page - 1) * size,
        take: size,
      });

      const appIds = rows.map((item) => item.appId);
      const appsInfo = await this.appEntity.find({ where: { id: In(appIds) } });

      rows.forEach((item: any) => {
        const app = appsInfo.find((c) => c.id === item.appId);
        item.appName = app ? app.name : '未知';
        item.appRole = app ? app.role : '未知';
        item.appDes = app ? app.des : '未知';
        item.coverImg = app ? app.coverImg : '未知';
        item.demoData = app ? app.demoData : '未知';
        item.preset = app.userId === id ? app.preset : '******';
      });
    } catch (error) {
      console.error(`處理用戶ID: ${id} 的mineApps請求時發生錯誤`, error); // 記錄可能的錯誤
      throw error; // 拋出錯誤，確保上層調用者知道發生了錯誤
    }

    return { rows, count };
  }
}
