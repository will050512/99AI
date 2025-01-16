import { ApiProperty } from '@nestjs/swagger';

export class AddAutoReplyDto {
  @ApiProperty({ example: '你是誰', description: '提問的問題', required: true })
  prompt: string;

  @ApiProperty({
    example: '我是AiFunSchool一站式平台提供的Ai服務機器人',
    description: '回答的答案',
    required: true,
  })
  answer: string;
}
