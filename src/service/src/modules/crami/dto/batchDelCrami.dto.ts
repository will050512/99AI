import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class BatchDelCramiDto {
  @ApiProperty({ example: 1, description: '要刪除的套餐Ids', required: true })
  @IsArray({ message: '參數類型為數組' })
  @ArrayMinSize(1, { message: '最短長度為1' })
  ids: number[];
}
