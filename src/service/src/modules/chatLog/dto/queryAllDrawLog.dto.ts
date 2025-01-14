import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class QuerAllDrawLogDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 1, description: '是否推薦0: 默認 1: 推薦', required: false })
  @IsOptional()
  rec: number;

  @ApiProperty({ example: 99, description: '生成圖片的用戶id', required: false })
  @IsOptional()
  userId: number;

  @ApiProperty({ example: 'DALL-E2', description: '生成圖片使用的模型', required: false })
  @IsOptional()
  model: string;
}
