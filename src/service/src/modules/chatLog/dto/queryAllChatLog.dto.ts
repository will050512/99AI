import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class QuerAllChatLogDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 99, description: '對話的用戶id', required: false })
  @IsOptional()
  userId: number;

  @ApiProperty({ example: '您好', description: '用戶詢問的問題', required: false })
  @IsOptional()
  prompt: string;

  @ApiProperty({ example: 'user', description: '身份', required: false })
  role: string;
}
