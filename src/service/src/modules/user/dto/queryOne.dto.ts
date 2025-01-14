import { IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryOneUserDto {
  @ApiProperty({ example: 1, nullable: true, description: '查詢用戶的id', required: false })
  @IsDefined({ message: '用戶id是必傳參數' })
  id: number;
}
