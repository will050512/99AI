import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { JwtAuthGuard } from '@/common/auth/jwtAuth.guard';
import { SuperAuthGuard } from '@/common/auth/superAuth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ChatLogService } from './chatLog.service';
import { ChatListDto } from './dto/chatList.dto';
import { DelDto } from './dto/del.dto';
import { DelByGroupDto } from './dto/delByGroup.dto';
import { ExportExcelChatlogDto } from './dto/exportExcelChatlog.dto';
import { QuerAllChatLogDto } from './dto/queryAllChatLog.dto';
import { QuerAllDrawLogDto } from './dto/queryAllDrawLog.dto';
import { QueryByAppIdDto } from './dto/queryByAppId.dto';
import { QuerMyChatLogDto } from './dto/queryMyChatLog.dto';
import { recDrawImgDto } from './dto/recDrawImg.dto';

@Controller('chatLog')
@ApiTags('ChatLog')
export class ChatLogController {
  constructor(private readonly chatLogService: ChatLogService) {}

  @Get('draw')
  @ApiOperation({ summary: '查詢我的繪製記錄' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  querDrawLog(@Query() query: QuerMyChatLogDto, @Req() req: Request) {
    return this.chatLogService.querDrawLog(req, query);
  }

  @Post('recDrawImg')
  @ApiOperation({ summary: '推薦此圖片對外展示' })
  @ApiBearerAuth()
  @UseGuards(SuperAuthGuard)
  recDrawImg(@Body() body: recDrawImgDto) {
    return this.chatLogService.recDrawImg(body);
  }

  @Get('drawAll')
  @ApiOperation({ summary: '查詢所有的繪製記錄' })
  querAllDrawLog(@Query() params: QuerAllDrawLogDto) {
    return this.chatLogService.querAllDrawLog(params);
  }

  @Get('chatAll')
  @ApiOperation({ summary: '查詢所有的問答記錄' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  queryAllChatLog(@Query() params: QuerAllChatLogDto, @Req() req: Request) {
    return this.chatLogService.querAllChatLog(params, req);
  }

  @Post('exportExcel')
  @ApiOperation({ summary: '導出問答記錄' })
  @ApiBearerAuth()
  exportExcel(@Body() body: ExportExcelChatlogDto, @Res() res: Response) {
    return this.chatLogService.exportExcel(body, res);
  }

  @Get('chatList')
  @ApiOperation({ summary: '查詢我的問答記錄' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  chatList(@Req() req: Request, @Query() params: ChatListDto) {
    return this.chatLogService.chatList(req, params);
  }

  @Post('del')
  @ApiOperation({ summary: '刪除我的問答記錄' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  del(@Req() req: Request, @Body() body: DelDto) {
    return this.chatLogService.deleteChatLog(req, body);
  }

  @Post('delByGroupId')
  @ApiOperation({ summary: '清空一組對話' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  delByGroupId(@Req() req: Request, @Body() body: DelByGroupDto) {
    return this.chatLogService.delByGroupId(req, body);
  }

  @Post('deleteChatsAfterId')
  @ApiOperation({ summary: '刪除對話組中某條對話及其後的所有對話' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteChatsAfterId(@Req() req: Request, @Body() body: any) {
    return this.chatLogService.deleteChatsAfterId(req, body);
  }

  @Get('byAppId')
  @ApiOperation({ summary: '查詢某個應用的問答記錄' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  byAppId(@Req() req: Request, @Query() params: QueryByAppIdDto) {
    return this.chatLogService.byAppId(req, params);
  }
}
