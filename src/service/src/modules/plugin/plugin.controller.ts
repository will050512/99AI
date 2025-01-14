import { SuperAuthGuard } from '@/common/auth/superAuth.guard';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PluginService } from './plugin.service';

@ApiTags('Plugin')
@Controller('plugin')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get('pluginList')
  @ApiOperation({ summary: '獲取Plugin' })
  pluginList(@Req() req: Request) {
    return this.pluginService.pluginList(req);
  }

  @Post('createPlugin')
  @ApiOperation({ summary: '創建Plugin' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  createPlugin(@Body() body: any) {
    return this.pluginService.createPlugin(body);
  }

  @Post('updatePlugin')
  @ApiOperation({ summary: '修改外掛' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  updatePlugin(@Body() body: any) {
    return this.pluginService.updatePlugin(body);
  }

  @Post('delPlugin')
  @ApiOperation({ summary: '刪除外掛' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  delPlugin(@Body() body: any) {
    return this.pluginService.delPlugin(body);
  }
}
