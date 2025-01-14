import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryBadWordsDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 'test', description: '敏感詞內容', required: false })
  @IsOptional()
  word: string;

  @ApiProperty({ example: 1, description: '關鍵詞狀態', required: false })
  @IsOptional()
  status: number;
}
