import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class QuerAllPackageDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 'name', description: '套餐名稱', required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ example: 1, description: '套餐狀態 0：禁用 1：啟用', required: false })
  @IsOptional()
  status: number;

  @ApiProperty({ example: 1, description: '套餐類型 -1：永久套餐 1：限時套餐', required: false })
  @IsOptional()
  type: number;
}
