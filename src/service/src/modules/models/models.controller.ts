import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ModelsService } from './models.service';
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SuperAuthGuard } from '@/common/auth/superAuth.guard';
import { SetModelDto } from './dto/setModel.dto';
import { QueryModelDto } from './dto/queryModel.dto';
import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { SetModelTypeDto } from './dto/setModelType.dto';
import { QueryModelTypeDto } from './dto/queryModelType.dto';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly modelsService: ModelsService
  ) { }

  @Post('setModel')
  @ApiOperation({ summary: '設置模型' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  setModel(@Body() params: SetModelDto) {
    return this.modelsService.setModel(params)
  }

  @Post('delModel')
  @ApiOperation({ summary: '刪除模型' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  delModel(@Body() params: { id: number }) {
    return this.modelsService.delModel(params)
  }

  @Get('query')
  @ApiOperation({ summary: '管理端查詢模型列表' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  queryModels(@Req() req: Request, @Query() params: QueryModelDto) {
    return this.modelsService.queryModels(req, params)
  }

  @Get('list')
  @ApiOperation({ summary: '客戶端查詢當前所有可以使用的模型' })
  modelsList() {
    return this.modelsService.modelsList()
  }

  @Get('mjInfo')
  @ApiOperation({ summary: '客戶端查詢當前所有可以使用的模型' })
  getMjInfo() {
    return this.modelsService.getMjInfo()
  }

  @Get('baseConfig')
  @ApiOperation({ summary: '客戶端查詢當前已經配置模型的基礎配置' })
  baseConfig() {
    return this.modelsService.getBaseConfig()
  }

  @Get('queryModelType')
  @ApiOperation({ summary: '查詢模型類型' })
  queryModelType(@Query() params: QueryModelTypeDto) {
    return this.modelsService.queryModelType(params)
  }

  @Post('setModelType')
  @ApiOperation({ summary: '創建修改模型類型' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  setModelType(@Body() params: SetModelTypeDto) {
    return this.modelsService.setModelType(params)
  }

  @Post('delModelType')
  @ApiOperation({ summary: '刪除模型類型' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  delModelType(@Body() params: { id: number }) {
    return this.modelsService.delModelType(params)
  }
}
