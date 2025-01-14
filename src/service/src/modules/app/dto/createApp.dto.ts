import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAppDto {
  @ApiProperty({ example: '前端助手', description: 'app名稱', required: true })
  @IsDefined({ message: 'app名稱是必傳參數' })
  name: string;

  @ApiProperty({ example: 1, description: 'app分類Id', required: true })
  @IsDefined({ message: 'app分類Id必傳參數' })
  catId: number;

  @ApiProperty({
    example: '適用於編程編碼、期望成為您的編程助手',
    description: 'app名稱詳情描述',
    required: false,
  })
  @IsDefined({ message: 'app名稱描述是必傳參數' })
  des: string;

  @ApiProperty({ example: '你現在是一個翻譯官。接下來我說的所有話幫我翻譯成中文', description: '預設的prompt', required: false })
  @IsOptional()
  preset: string;

  @ApiProperty({ example: 'GPTs 的調用ID', description: 'GPTs 使用的 ID', required: false })
  @IsOptional()
  gizmoID: string;

  @ApiProperty({  description: '是否GPTs', required: false })
  @IsOptional()
  isGPTs: number;

  @ApiProperty({ example: 'https://xxxx.png', description: '套餐封面圖片', required: false })
  @IsOptional()
  coverImg: string;

  @ApiProperty({ example: 100, description: '套餐排序、數字越大越靠前', required: false })
  @IsOptional()
  order: number;

  @ApiProperty({ example: 1, description: '套餐狀態 0：禁用 1：啟用', required: true })
  @IsNumber({}, { message: '套餐狀態必須是Number' })
  @IsIn([0, 1, 3, 4, 5], { message: '套餐狀態錯誤' })
  status: number;

  @ApiProperty({ example: '這是一句示例數據', description: 'app示例數據', required: false })
  demoData: string;

  @ApiProperty({ example: 'system', description: '創建的角色', required: false })
  role: string;
}
