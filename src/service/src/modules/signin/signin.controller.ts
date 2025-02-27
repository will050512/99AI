import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { SigninService } from './signin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwtAuth.guard';
import { Request } from 'express';

@ApiTags('signIn')
@Controller('signin')
export class SigninController {
  constructor(private readonly signinService: SigninService) {}

  @Post('sign')
  @ApiOperation({ summary: '用戶簽到' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sign(@Req() req: Request) {
    return await this.signinService.sign(req);
  }

  @Get('signinLog')
  @ApiOperation({ summary: '獲取用戶簽到資訊' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getSigninLog(@Req() req: Request) {
    return await this.signinService.getSigninLog(req);
  }
}
