import { IsNotEmpty, MinLength, MaxLength, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Options {
  @IsString()
  parentMessageId: string;
  model?: string;
  temperature?: number;
  top_p?: number;
  groupId?: number;
}

export class ChatProcessDto {
  @ApiProperty({ example: 'hello, Who are you', description: '對話資訊' })
  @IsNotEmpty({ message: '提問資訊不能為空！' })
  prompt: string;

  @ApiProperty({ example: 'https://aiweb.com', description: '對話附帶的鏈接', required: false })
  url: string;

  @ApiProperty({ example: '{ parentMessageId: 0 }', description: '上次對話資訊', required: false })
  @Type(() => Options)
  options: Options;

  @ApiProperty({
    example: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    description: '系統預設資訊',
  })

  @IsOptional()
  systemMessage?: string;

  @ApiProperty({ example: 1, description: '應用id', required: false })
  @IsOptional()
  appId: number;

  @ApiProperty({ example: "gpt-3.5-turbo", description: '使用模型', required: false })
  @IsOptional()
  model: string;

}
