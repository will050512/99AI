import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CustomAppDto {
  @ApiProperty({ example: '前端助手', description: 'app名稱', required: true })
  name: string;

  @ApiProperty({ example: 1, description: 'app分類Id', required: true })
  catId: number;

  @ApiProperty({
    example: '適用於編程編碼、期望成為您的編程助手',
    description: 'app名稱詳情描述',
    required: false,
  })
  @IsDefined({ message: 'app名稱描述是必傳參數' })
  des: string;

  @ApiProperty({ example: '你現在是一個翻譯官。接下來我說的所有話幫我翻譯成中文', description: '預設的prompt', required: true })
  preset: string;

  @ApiProperty({ example: 'https://xxxx.png', description: '套餐封面圖片', required: false })
  coverImg: string;

  @ApiProperty({ example: '這是一句示例數據', description: 'app示例數據', required: false })
  demoData: string;

  @ApiProperty({ example: false, description: '是否共享到所有人', required: false })
  public: boolean;

  @ApiProperty({ example: 1, description: '應用ID', required: false })
  @IsOptional()
  appId: number;
}
