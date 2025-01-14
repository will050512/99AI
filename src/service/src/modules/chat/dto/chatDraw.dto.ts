import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDrawDto {
  @ApiProperty({ example: 'Draw a cute little dog', description: '繪畫描述資訊' })
  prompt: string;

  @ApiProperty({ example: 1, description: '繪畫張數', required: true })
  n: number;

  @ApiProperty({ example: '1024x1024', description: '圖片尺寸', required: true })
  size: string;

  @ApiProperty({ example: 'standard', description: '圖片質量', required: true })
  quality: string;

  @ApiProperty({
    example:
      'close-up polaroid photo, of a little joyful cute panda, in the forest, sun rays coming, photographic, sharp focus, depth of field, soft lighting, heigh quality, 24mm, Nikon Z FX',
    description: '繪畫提示詞！',
    required: true,
  })

  @ApiProperty({ example: '--ar 16:9 --c 0', description: '除了prompt的額外參數' })
  @IsOptional()
  extraParam?: string;

  @ApiProperty({ example: 'https://xsdasdasd.com', description: '墊圖圖片地址' })
  @IsOptional()
  imgUrl?: string;

  @ApiProperty({ example: 'IMAGINE', description: '任務類型,可用值:IMAGINE,UPSCALE,VARIATION,ZOOM,PAN,DESCRIBE,BLEND,SHORTEN,SWAP_FACE' })
  @IsOptional()
  action: string;

  @ApiProperty({ example: 1, description: '變體或者放大的序號' })
  @IsOptional()
  orderId: number;

  @ApiProperty({ example: 1, description: '繪畫的DBID' })
  @IsOptional()
  drawId: number;

  @ApiProperty({ example: 1, description: 'customId' })
  @IsOptional()
  customId: string;

  @ApiProperty({ example: 1, description: 'base64' })
  @IsOptional()
  base64: string;

  @ApiProperty({ example: 1, description: '任務ID' })
  @IsOptional()
  taskId: number;
}
