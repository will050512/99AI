import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryAllUserDto {
  @ApiProperty({ example: 1, description: '查詢頁數', required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, description: '每頁數量', required: false })
  @IsOptional()
  size: number;

  @ApiProperty({ example: '小九', description: '用戶姓名', required: false })
  @IsOptional()
  username: string;

  @ApiProperty({ example: 'J_longyan@163.com', description: '用戶郵箱', required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ example: '18888888888', description: '用戶手機號碼', required: false })
  @IsOptional()
  phone: string;
  
  @ApiProperty({ example: 2, description: '用戶狀態', required: false })
  @IsOptional()
  status: number;

  @ApiProperty({ example: 'super', description: '關鍵字查詢', required: false })
  @IsOptional()
  keyword: string;
}
