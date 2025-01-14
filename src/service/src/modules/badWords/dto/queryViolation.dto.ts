import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryViolationDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 1, description: '用戶ID', required: false })
  @IsOptional()
  userId: number;

  @ApiProperty({ example: '百度雲檢測', description: '檢測平臺來源', required: false })
  @IsOptional()
  typeOriginCn: string;
}
