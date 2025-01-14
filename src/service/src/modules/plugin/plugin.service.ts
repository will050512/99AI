import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ModelsService } from '../models/models.service';
import { PluginEntity } from './plugin.entity';

@Injectable()
export class PluginService {
  constructor(
    @InjectRepository(PluginEntity)
    private readonly PluginEntity: Repository<PluginEntity>,
    private readonly modelsService: ModelsService
  ) {}

  // 獲取外掛列表
  // async pluginList(query: any) {
  //   const { page = 1, size = 100 } = query;
  //   // 查詢所有外掛
  //   const rows = await this.PluginEntity.find({
  //     order: { sortOrder: 'ASC', id: 'DESC' },
  //     skip: (page - 1) * size,
  //     take: size,
  //   });
  //   // console.log(rows);

  //   // 返回結果
  //   return { rows, count: rows.length };
  // }

  async pluginList(query: any) {
    const { page = 1, size = 100 } = query;
    // 查詢所有外掛
    const rows = await this.PluginEntity.find({
      order: { sortOrder: 'ASC', id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    // 處理外掛列表
    const processedRows = await Promise.all(
      rows.map(async (plugin) => {
        if (plugin.isSystemPlugin === 1) {
          try {
            const parameters = await this.modelsService.getCurrentModelKeyInfo(
              plugin.parameters
            );
            const deductType = parameters.deductType;

            // 將 parameters 和 deductType 作為附加參數返回
            return {
              ...plugin,
              deductType,
            };
          } catch (error) {
            // 出現異常時返回 deductType 為 0
            return {
              ...plugin,
              deductType: 0,
            };
          }
        } else {
          // 非系統外掛，直接返回 deductType 為 0

          return {
            ...plugin,
            deductType: 0,
          };
        }
      })
    );

    // 過濾掉為 null 的外掛
    const filteredRows = processedRows.filter((plugin) => plugin !== null);

    // 返回結果
    return { rows: filteredRows, count: filteredRows.length };
  }

  // 創建外掛
  async createPlugin(body: any) {
    const {
      name,
      pluginImg,
      description,

      isEnabled,
      isSystemPlugin,
      parameters,
      sortOrder,
    } = body;

    // 檢查外掛名稱是否存在
    const existingPlugin = await this.PluginEntity.findOne({
      where: { name },
    });
    if (existingPlugin) {
      throw new HttpException('該外掛名稱已存在！', HttpStatus.BAD_REQUEST);
    }

    // 創建新的外掛實體
    const newPlugin = this.PluginEntity.create({
      name,
      pluginImg,
      description,

      isEnabled: isEnabled !== undefined ? isEnabled : 1, // 默認啟用
      isSystemPlugin: isSystemPlugin !== undefined ? isSystemPlugin : 0, // 默認非系統外掛
      parameters,
      sortOrder: sortOrder !== undefined ? sortOrder : 0, // 默認排序值
    });

    // 保存新外掛
    return await this.PluginEntity.save(newPlugin);
  }

  // 修改外掛
  async updatePlugin(body: any) {
    const {
      id,
      name,
      pluginImg,
      description,
      isEnabled,
      isSystemPlugin,
      parameters,
      sortOrder,
    } = body;

    // 檢查外掛ID是否存在
    const existingPlugin = await this.PluginEntity.findOne({
      where: { id },
    });
    if (!existingPlugin) {
      throw new HttpException('外掛不存在！', HttpStatus.BAD_REQUEST);
    }

    // 檢查外掛名稱是否存在，排除當前外掛ID
    const duplicatePlugin = await this.PluginEntity.findOne({
      where: { name, id: Not(id) },
    });
    if (duplicatePlugin) {
      throw new HttpException('該外掛名稱已存在！', HttpStatus.BAD_REQUEST);
    }

    // 更新外掛實體
    existingPlugin.name = name;
    existingPlugin.pluginImg = pluginImg;
    existingPlugin.description = description;
    existingPlugin.isEnabled =
      isEnabled !== undefined ? isEnabled : existingPlugin.isEnabled;
    existingPlugin.isSystemPlugin =
      isSystemPlugin !== undefined
        ? isSystemPlugin
        : existingPlugin.isSystemPlugin;
    existingPlugin.parameters = parameters;
    existingPlugin.sortOrder =
      sortOrder !== undefined ? sortOrder : existingPlugin.sortOrder;

    // 保存修改後的外掛
    await this.PluginEntity.save(existingPlugin);

    return '修改外掛資訊成功';
  }

  // 刪除外掛
  async delPlugin(body: PluginEntity) {
    const { id } = body;

    // 檢查外掛是否存在
    const existingPlugin = await this.PluginEntity.findOne({
      where: { id },
    });
    if (!existingPlugin) {
      throw new HttpException('該外掛不存在！', HttpStatus.BAD_REQUEST);
    }

    // 刪除外掛
    const deleteResult = await this.PluginEntity.delete(id);

    // 檢查是否成功刪除外掛
    if (deleteResult.affected > 0) {
      return '刪除外掛成功';
    } else {
      throw new HttpException('刪除外掛失敗！', HttpStatus.BAD_REQUEST);
    }
  }
}
