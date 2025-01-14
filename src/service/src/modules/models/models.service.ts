import { ModelsMapCn } from '@/common/constants/status.constant';
import { hideString } from '@/common/utils';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { QueryModelDto } from './dto/queryModel.dto';
import { SetModelDto } from './dto/setModel.dto';
import { ModelsEntity } from './models.entity';
// import { ModelsTypeEntity } from './modelType.entity';
import { QueryModelTypeDto } from './dto/queryModelType.dto';
import { SetModelTypeDto } from './dto/setModelType.dto';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelsEntity)
    private readonly modelsEntity: Repository<ModelsEntity> // @InjectRepository(ModelsTypeEntity) // private readonly modelsTypeEntity: Repository<ModelsTypeEntity>,
  ) {}

  private modelTypes = [];
  private modelMaps = {};
  private keyList = {};

  private keyPoolMap = {}; // 記錄每個模型的所有key 並且記錄順序
  private keyPoolIndexMap = {}; // 記錄每個模型的當前調用的下標

  async onModuleInit() {
    await this.initCalcKey();
  }

  /* 初始化整理所有key 進行分類並且默認一個初始模型配置 默認是配置的第一個分類的第一個key為準 */
  async initCalcKey() {
    this.keyPoolMap = {};
    this.keyPoolIndexMap = {};
    this.keyList = {};
    this.modelMaps = {};
    this.modelTypes = [];
    const allKeys = await this.modelsEntity.find({ where: { status: true } });
    const keyTypes = allKeys.reduce((pre: any, cur) => {
      if (!pre[cur.keyType]) {
        pre[cur.keyType] = [cur];
      } else {
        pre[cur.keyType].push(cur);
      }
      return pre;
    }, {});
    this.modelTypes = Object.keys(keyTypes).map((keyType) => {
      return { label: ModelsMapCn[keyType], val: keyType };
    });
    this.modelMaps = keyTypes;
    this.keyList = {};

    allKeys.forEach((keyDetail) => {
      const { keyType, model } = keyDetail;

      // 初始化 keyPoolMap 中的 model 數組
      if (!this.keyPoolMap[model]) this.keyPoolMap[model] = [];
      this.keyPoolMap[model].push(keyDetail);

      // 初始化 keyPoolIndexMap 中的 model 索引
      if (!this.keyPoolIndexMap[model]) this.keyPoolIndexMap[model] = 0;

      // 初始化 keyList 中的 keyType 和 model 層次結構
      if (!this.keyList[keyType]) this.keyList[keyType] = {};
      if (!this.keyList[keyType][model]) this.keyList[keyType][model] = [];
      this.keyList[keyType][model].push(keyDetail);
    });
  }

  /* lock key 自動鎖定key */
  async lockKey(keyId, remark, keyStatus = -1) {
    const res = await this.modelsEntity.update(
      { id: keyId },
      { status: false, keyStatus, remark }
    );
    Logger.error(`key: ${keyId} 欠費或被官方封禁導致不可用，已被系統自動鎖定`);
    this.initCalcKey();
  }

  async getCurrentModelKeyInfo(model: string) {
    // 使用findOne查詢特定模型的key資訊
    let modelKeyInfo = await this.modelsEntity.findOne({
      where: { model: model },
    });

    // 檢查是否找到了模型的key資訊
    if (!modelKeyInfo) {
      // const openaiBaseModel = await this.globalConfigService.getConfigs([
      //   'openaiBaseModel',
      // ]);
      // modelKeyInfo = await this.modelsEntity.findOne({
      //   where: { model: openaiBaseModel },
      // });
      // throw new HttpException(
      //   '當前調用模型的key未找到，請重新選擇模型！',
      //   HttpStatus.BAD_REQUEST
      // );
      // Logger.debug('當前調用模型的key未找到，請重新選擇模型！');
      return null;
    }

    // 假設modelKeyInfo對象有一個屬性key儲存模型的key
    return modelKeyInfo;
  }

  // async getSpecialModelKeyInfo(modelPrefix) {
  //   // 查找所有包含指定前綴的鍵名
  //   const modelKeys = Object.keys(this.keyPoolMap).filter(key => key.startsWith(modelPrefix));

  //   if (modelKeys.length === 0) {
  //     throw new HttpException('當前調用模型已經被移除，請重新選擇模型！', HttpStatus.BAD_REQUEST);
  //   }

  //   // 選擇第一個匹配項
  //   const firstMatchModelKey = modelKeys[0];

  //   // 更新調用下標
  //   this.keyPoolIndexMap[firstMatchModelKey]++;
  //   if (this.keyPoolIndexMap[firstMatchModelKey] >= this.keyPoolMap[firstMatchModelKey].length) {
  //     this.keyPoolIndexMap[firstMatchModelKey] = 0;
  //   }

  //   // 獲取對應的鍵值
  //   const key = this.keyPoolMap[firstMatchModelKey][this.keyPoolIndexMap[firstMatchModelKey]];

  //   // 修改模型名稱中的前綴部分
  //   const modifiedModel = firstMatchModelKey.replace(modelPrefix, '');

  //   // 將修改後的模型名稱添加到key對象中（假設key對象是個包含model字段的對象）
  //   key.model = modifiedModel;

  //   // 返回包含修改後的模型名稱的key對象
  //   return key;
  // }

  async getSpecialModelKeyInfo(modelPrefix) {
    // 使用Like操作符進行模糊查詢
    const matchingModels = await this.modelsEntity.find({
      where: { model: Like(`${modelPrefix}%`) },
    });

    if (matchingModels.length === 0) {
      throw new HttpException(
        '未找到匹配的模型，請重新選擇模型！',
        HttpStatus.BAD_REQUEST
      );
    }

    // 選擇第一個匹配的模型
    const firstMatchModel = matchingModels[0];

    // 去除model名稱中的前綴
    // 假設這裡的modelPrefix正是你想從模型名稱中去除的前綴部分
    const modifiedModelName = firstMatchModel.model.replace(modelPrefix, '');

    // 如果你需要在返回的對象中保留原始的model名稱，可以複製對象並修改
    // 如果直接修改firstMatchModel對象也是可行的，這取決於你的具體需求
    const modifiedModel = {
      ...firstMatchModel,
      model: modifiedModelName,
    };

    // 直接返回修改後的模型資訊
    return modifiedModel;
  }

  /* 通過現有配置的key和分類給到默認的配置資訊 默認給到第一個分類的第一個key的配置 */
  async getBaseConfig(): Promise<any> {
    if (!this.modelTypes.length || !Object.keys(this.modelMaps).length) return;
    const {
      keyType,
      modelName,
      model,
      deductType,
      deduct,
      isFileUpload,
      modelAvatar,
      modelDescription,
    } = this.modelMaps[1][0]; // 取到第一個默認的配置項資訊
    return {
      modelInfo: {
        keyType,
        modelName,
        model,
        deductType,
        deduct,
        isFileUpload,
        modelAvatar,
        modelDescription,
      },
    };
  }

  async setModel(params: SetModelDto) {
    try {
      // 檢查並處理NaN值
      if (isNaN(params.timeout)) {
        // 如果timeout是NaN，則可以選擇設置為null或者一個默認值
        params.timeout = null; // 或者任何合適的默認值，如0
      }
      const { id } = params;
      params.status && (params.keyStatus = 1);
      if (id) {
        const res = await this.modelsEntity.update({ id }, params);
        await this.initCalcKey();
        return res.affected > 0;
      } else {
        const { keyType, key } = params;
        if (Number(keyType !== 1)) {
          const res = await this.modelsEntity.save(params);
          await this.initCalcKey();
          return res;
        } else {
          const data = key.map((k) => {
            try {
              const data = JSON.parse(JSON.stringify(params));
              data.key = k;
              // 對於每個key的處理中也檢查NaN
              if (isNaN(data.timeout)) {
                data.timeout = null; // 同樣處理NaN
              }
              return data;
            } catch (error) {
              console.log('parse error: ', error);
            }
          });
          const res = await this.modelsEntity.save(data);
          await this.initCalcKey();
          return res;
        }
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }

  async delModel({ id }) {
    if (!id) {
      throw new HttpException('缺失必要參數！', HttpStatus.BAD_REQUEST);
    }
    const m = await this.modelsEntity.findOne({ where: { id } });
    if (!m) {
      throw new HttpException('當前賬號不存在！', HttpStatus.BAD_REQUEST);
    }
    const res = await this.modelsEntity.delete({ id });
    await this.initCalcKey();
    return res;
  }

  async queryModels(req, params: QueryModelDto) {
    const { role } = req.user;
    const { keyType, key, status, model, page = 1, size = 10 } = params;
    let where: any = {};
    keyType && (where.keyType = keyType);
    model && (where.model = model);
    status && (where.status = Number(status) === 1 ? true : false);
    key && (where.key = Like(`%${key}%`));
    const [rows, count] = await this.modelsEntity.findAndCount({
      where: where,
      order: {
        modelOrder: 'ASC',
      },
      skip: (page - 1) * size,
      take: size,
    });
    if (role !== 'super') {
      rows.forEach((item) => {
        item.key && (item.key = hideString(item.key));
      });
    }

    return { rows, count };
  }

  /* 客戶端查詢到的所有的配置的模型類別 以及類別下自定義的多少中文模型名稱 */
  async modelsList() {
    const cloneModelMaps = JSON.parse(JSON.stringify(this.modelMaps));
    Object.keys(cloneModelMaps).forEach((key) => {
      // 對每個模型進行排序
      cloneModelMaps[key] = cloneModelMaps[key]
        .filter((t) => t.keyStatus === 1) // 篩選出 keyStatus 為 1 的項
        .sort((a, b) => a.modelOrder - b.modelOrder);
      cloneModelMaps[key] = Array.from(
        cloneModelMaps[key]
          .map((t) => {
            const {
              modelName,
              keyType,
              model,
              deduct,
              deductType,
              maxRounds,
              modelAvatar,
              isFileUpload,
              modelDescription,
            } = t;
            return {
              modelName,
              keyType,
              model,
              deduct,
              deductType,
              maxRounds,
              modelAvatar,
              isFileUpload,
              modelDescription,
            };
          })
          .reduce((map, obj) => map.set(obj.modelName, obj), new Map())
          .values()
      );
    });

    return {
      modelTypeList: this.modelTypes,
      modelMaps: cloneModelMaps,
    };
  }

  async getMjInfo() {
    // 使用findOne查詢特定模型的資訊
    const modelInfo = await this.modelsEntity.findOne({
      where: { model: 'midjourney' },
    });

    // 如果查詢到模型資訊，返回相關數據
    if (modelInfo) {
      // 你可以根據需要選擇返回哪些字段
      return {
        modelName: modelInfo.modelName,
        model: modelInfo.model,
        deduct: modelInfo.deduct,
        deductType: modelInfo.deductType,
      };
    } else {
      // 如果沒有查詢到模型資訊，可以根據需要處理，比如返回null或者拋出錯誤
      return null;
    }
  }

  /* 記錄使用次數和使用的token數量 */
  async saveUseLog(id, useToken) {
    await this.modelsEntity
      .createQueryBuilder()
      .update(ModelsEntity)
      .set({
        useCount: () => 'useCount + 1',
        useToken: () => `useToken + ${useToken}`,
      })
      .where('id = :id', { id })
      .execute();
  }

  /* 獲取一張繪畫key */
  // async getRandomDrawKey() {
  //   const drawkeys = await this.modelsEntity.findOne({ where: { status: true } })
  //   // if (!drawkeys.length) {
  //   //   throw new HttpException('當前未指定特殊模型KEY、前往後臺模型池設置吧！', HttpStatus.BAD_REQUEST)
  //   // }
  //   return getRandomItemFromArray(drawkeys)
  // }

  /* 獲取所有key */
  async getAllKey() {
    return await this.modelsEntity.find();
  }

  /* 查詢模型類型 */
  async queryModelType(params: QueryModelTypeDto) {
    return 1;
  }

  /* 創建修改模型類型 */
  async setModelType(params: SetModelTypeDto) {
    return 1;
  }

  /* 刪除模型類型 */
  async delModelType(params) {
    return 1;
  }
}
