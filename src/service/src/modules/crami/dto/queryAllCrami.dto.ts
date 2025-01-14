import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class QuerAllCramiDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 1, description: '使用人Id', required: false })
  @IsOptional()
  useId: number;

  @ApiProperty({ example: 1, description: '序號狀態 0：未使用 1：已消費', required: false })
  @IsOptional()
  status: number;
}
