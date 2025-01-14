import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QuerAppDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: 'name', description: 'app名稱', required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ example: 1, description: 'app狀態 0：禁用 1：啟用 3:審核加入廣場中 4：已拒絕加入廣場', required: false })
  @IsOptional()
  status: number;

  @ApiProperty({ example: 2, description: 'app分類Id', required: false })
  @IsOptional()
  catId: number;

  @ApiProperty({ example: 'role', description: 'app角色', required: false })
  @IsOptional()
  role: string;

  @ApiProperty({ example: '關鍵詞', description: '搜索關鍵詞', required: false })
  @IsOptional()
  keyword: string;
}
