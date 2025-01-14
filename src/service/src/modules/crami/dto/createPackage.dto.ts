import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsIn,
  IsOptional,
  Max,
  Min,
  ValidateNested,
  IsNumber,
  IsDefined,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ example: '基礎套餐100次卡', description: '套餐名稱', required: true })
  @IsDefined({ message: '套餐名稱是必傳參數' })
  name: string;

  @ApiProperty({
    example: '這是一個100次對話餘額的套餐，我們將為您額外贈送3次繪畫餘額，活動期間，我們將在套餐基礎上額外贈送您十次對話餘額和1次繪畫餘額',
    description: '套餐詳情描述',
    required: true,
  })
  @IsDefined({ message: '套餐描述是必傳參數' })
  des: string;

  @ApiProperty({ example: 7, default: 0, description: '套餐等級設置' })
  @IsNumber({}, { message: '套餐等級權重必須為數字' })
  weight: number;

  @ApiProperty({ example: 1, description: '套餐扣費類型 1：按次數 2：按Token', required: true })
  deductionType: number;

  @ApiProperty({ example: 'https://xxxx.png', description: '套餐封面圖片' })
  @IsOptional()
  coverImg: string;

  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ example: 100, description: '套餐排序、數字越大越靠前' })
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 1, description: '套餐狀態 0：禁用 1：啟用', required: true })
  @IsNumber({}, { message: '套餐狀態必須是Number' })
  @IsIn([0, 1], { message: '套餐狀態錯誤' })
  status: number;

  @ApiProperty({ example: 7, default: 0, description: '套餐有效期 -1為永久不過期' })
  @IsNumber({}, { message: '套餐有效期天數類型必須是number' })
  days: number;

  @ApiProperty({ example: 1000, default: 0, description: '模型3對話次數' })
  @IsNumber({}, { message: '模型3對話次數必須是number類型' })
  model3Count: number;

  @ApiProperty({ example: 10, default: 0, description: '模型4對話次數' })
  @IsNumber({}, { message: '模型4對話次數必須是number類型' })
  model4Count: number;

  @ApiProperty({ example: 10, default: 0, description: 'MJ繪畫次數' })
  @IsNumber({}, { message: 'MJ繪畫次數必須是number類型' })
  drawMjCount: number;

  // @ApiProperty({ example: 0, description: '序號攜帶的用戶餘額金額' })
  // @IsNumber({}, { message: '序號餘額類型必須是number' })
  // balance: number;

  // @ApiProperty({ example: 100, description: '序號攜帶的用戶對話次數' })
  // @IsNumber({}, { message: '對話次數類型必須是number' })
  // usesLeft: number;

  // @ApiProperty({ example: 3, description: '序號攜帶的用戶繪畫次數' })
  // @IsNumber({}, { message: '繪畫次數類型必須是number' })
  // paintCount: number;

  // @ApiProperty({ example: 1, description: '是否開啟額外贈送狀態 0：關閉 1：開啟' })
  // @IsNumber({}, { message: '是否開啟額外贈送狀態必須是Number' })
  // @IsIn([0, 1], { message: '是否開啟額外贈送狀態只能是0或1' })
  // @IsOptional()
  // extraReward: number;

  // @ApiProperty({ example: 0, description: '序號攜帶的額外贈送用戶餘額金額' })
  // @IsNumber({}, { message: '額外贈送序號餘額類型必須是number' })
  // @IsOptional()
  // extraBalance: number;

  // @ApiProperty({ example: 10, description: '序號攜帶的額外贈送用戶對話次數' })
  // @IsNumber({}, { message: '額外贈送對話次數類型必須是number' })
  // @IsOptional()
  // extraUsesLeft: number;

  // @ApiProperty({ example: 1, description: '序號攜帶的額外贈送用戶繪畫次數' })
  // @IsNumber({}, { message: '額外贈送繪畫次數類型必須是number' })
  // @IsOptional()
  // extraPaintCount: number;
}
