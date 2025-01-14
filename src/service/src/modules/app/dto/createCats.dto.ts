import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, IsNumber, IsOptional } from 'class-validator';

export class CreateCatsDto {
  @ApiProperty({
    example: '編程助手',
    description: 'app分類名稱',
    required: true,
  })
  @IsDefined({ message: 'app分類名稱是必傳參數' })
  name: string;

  @ApiProperty({
    example: 100,
    description: '分類排序、數字越大越靠前',
    required: false,
  })
  @IsOptional()
  order: number;

  @ApiProperty({
    example: 1,
    description: '分類狀態 0：禁用 1：啟用',
    required: true,
  })
  @IsNumber({}, { message: '狀態必須是Number' })
  @IsIn([0, 1, 3, 4, 5], { message: '套餐狀態錯誤' })
  status: number;
}
