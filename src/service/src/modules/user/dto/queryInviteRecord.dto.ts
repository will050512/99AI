import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class queryInviteRecordDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;
}
