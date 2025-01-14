import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { JwtAuthGuard } from '@/common/auth/jwtAuth.guard';
import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserBalanceService } from './userBalance.service';

@ApiTags('balance')
@Controller('balance')
export class UserBalanceController {
  constructor(private userBalanceService: UserBalanceService) {}

  @Get('rechargeLog')
  @ApiOperation({ summary: '獲取個人充值記錄' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRechargeLog(@Req() req: Request, @Query() params: any) {
    return this.userBalanceService.getRechargeLog(req, params);
  }

  @Get('accountLog')
  @ApiOperation({ summary: '獲取所有人賬戶記錄' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async getAccountLog(@Req() req: Request, @Query() params: any) {
    return this.userBalanceService.getAccountLog(req, params);
  }

  @Get('query')
  @ApiOperation({ summary: '獲取個人餘額資訊' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBalance(@Req() req: Request) {
    return this.userBalanceService.queryUserBalance(req.user.id);
  }

  @Post('inheritVisitorData')
  @ApiOperation({ summary: '繼承當前設備數據' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async inheritVisitorData(@Req() req: Request) {
    return this.userBalanceService.inheritVisitorData(req);
  }

  @Get('getVisitorCount')
  @ApiOperation({ summary: '獲取本機指紋數據' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getVisitorCount(@Req() req: Request) {
    return this.userBalanceService.getVisitorCount(req);
  }
}
