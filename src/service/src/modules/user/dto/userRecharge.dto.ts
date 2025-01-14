import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserRechargeDto {
  @ApiProperty({ example: 1, description: '用戶id', required: true })
  @IsDefined({ message: '用戶id是必傳參數' })
  userId: number;

  @ApiProperty({ example: 100, description: '用戶對話模型3次數', required: false })
  @IsOptional()
  model3Count?: number;

  @ApiProperty({ example: 5, description: '用戶對話模型4次數', required: false })
  @IsOptional()
  model4Count?: number;

  @ApiProperty({ example: 0, description: '用戶MJ額度', required: false })
  @IsOptional()
  drawMjCount?: number;
}
