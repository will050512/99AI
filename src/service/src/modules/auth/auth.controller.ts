import { JwtAuthGuard } from '@/common/auth/jwtAuth.guard';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/authLogin.dto';
import { UserRegisterDto } from './dto/authRegister.dto';
import { UpdatePassByOtherDto } from './dto/updatePassByOther.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用戶註冊' })
  async register(@Body() body: UserRegisterDto, @Req() req: Request) {
    return await this.authService.register(body, req);
  }

  @Post('login')
  @ApiOperation({ summary: '用戶登錄' })
  async login(@Body() body: UserLoginDto, @Req() req: Request) {
    return this.authService.login(body, req);
  }

  // Todo 類型待優化
  @Post('loginWithCaptcha')
  @ApiOperation({ summary: '用戶使用驗證碼登錄' })
  async loginWithCaptcha(@Body() body: any, @Req() req: Request) {
    return this.authService.loginWithCaptcha(body, req);
  }

  @Post('updatePassword')
  @ApiOperation({ summary: '用戶更改密碼' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePassword(@Req() req: Request, @Body() body: UpdatePasswordDto) {
    return this.authService.updatePassword(req, body);
  }

  @Post('updatePassByOther')
  @ApiOperation({ summary: '用戶更改密碼' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePassByOther(
    @Req() req: Request,
    @Body() body: UpdatePassByOtherDto
  ) {
    return this.authService.updatePassByOther(req, body);
  }

  @Get('getInfo')
  @ApiOperation({ summary: '獲取用戶個人資訊' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getInfo(@Req() req: Request) {
    return this.authService.getInfo(req);
  }

  @Post('sendCode')
  @ApiOperation({ summary: '發送驗證碼' })
  async sendCode(@Body() parmas: any) {
    return this.authService.sendCode(parmas);
  }

  @Post('sendPhoneCode')
  @ApiOperation({ summary: '發送手機驗證碼' })
  async sendPhoneCode(@Body() parmas: any) {
    return this.authService.sendPhoneCode(parmas);
  }

  @Post('verifyIdentity')
  @ApiOperation({ summary: '驗證身份' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async verifyIdentity(@Req() req: Request, @Body() body: any) {
    return this.authService.verifyIdentity(req, body);
  }

  @Post('verifyPhoneIdentity')
  @ApiOperation({ summary: '驗證手機號' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async verifyPhoneIdentity(@Req() req: Request, @Body() body: any) {
    return this.authService.verifyPhoneIdentity(req, body);
  }
}
