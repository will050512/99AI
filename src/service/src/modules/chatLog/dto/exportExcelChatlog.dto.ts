import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class ExportExcelChatlogDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: '您好', description: '用戶詢問的問題', required: false })
  @IsOptional()
  prompt: string;

  @ApiProperty({ example: 'J_longyan@163.com', description: '用戶郵箱', required: false })
  @IsOptional()
  email: string;

  // @ApiProperty({ example: '小九', description: '用戶名稱', required: false })
  // @IsOptional()
  // username: string;
}
