import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { SuperAuthGuard } from '@/common/auth/superAuth.guard';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutoreplyService } from './autoreply.service';
import { AddAutoReplyDto } from './dto/addAutoReply.dto';
import { DelAutoReplyDto } from './dto/delBadWords.dto';
import { QueryAutoReplyDto } from './dto/queryAutoReply.dto';
import { UpdateAutoReplyDto } from './dto/updateAutoReply.dto';

@ApiTags('autoreply')
@Controller('autoreply')
export class AutoreplyController {
  constructor(private readonly autoreplyService: AutoreplyService) {}

  @Get('query')
  @ApiOperation({ summary: '查詢自動回覆' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  queryAutoreply(@Query() query: QueryAutoReplyDto) {
    return this.autoreplyService.queryAutoreply(query);
  }

  @Post('add')
  @ApiOperation({ summary: '添加自動回覆' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  addAutoreply(@Body() body: AddAutoReplyDto) {
    return this.autoreplyService.addAutoreply(body);
  }

  @Post('update')
  @ApiOperation({ summary: '修改自動回覆' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  updateAutoreply(@Body() body: UpdateAutoReplyDto) {
    return this.autoreplyService.updateAutoreply(body);
  }

  @Post('del')
  @ApiOperation({ summary: '刪除自動回覆' })
  @UseGuards(SuperAuthGuard)
  @ApiBearerAuth()
  delAutoreply(@Body() body: DelAutoReplyDto) {
    return this.autoreplyService.delAutoreply(body);
  }
}
