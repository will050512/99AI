import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class QueryByOrderIdDto {
  @ApiProperty({ example: 'qwdadadwe-qeqwfcadqw-gguytewj', description: '訂單ID', required: false })
  orderId: string;
}
