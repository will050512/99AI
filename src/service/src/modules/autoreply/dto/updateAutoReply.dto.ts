import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateAutoReplyDto {
  @ApiProperty({ example: 1, description: '自動回覆id', required: true })
  @IsOptional()
  id: number;

  @ApiProperty({ example: '你可以幹嘛', description: '問題', required: false })
  @IsOptional()
  prompt: string;

  @ApiProperty({
    example: '我可以幹很多事情.......',
    description: '答案',
    required: false,
  })
  @IsOptional()
  answer: string;

  @ApiProperty({ example: 0, description: '狀態', required: false })
  @IsOptional()
  status: number;
}
