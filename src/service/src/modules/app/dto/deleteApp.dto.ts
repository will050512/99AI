import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OperateAppDto {
  @ApiProperty({ example: 1, description: '要刪除的appId', required: true })
  @IsNumber({}, { message: 'ID必須是Number' })
  id: number;
}
