import { ApiProperty } from '@nestjs/swagger';

export class QueryModelDto {
  @ApiProperty({ example: 1, description: '頁碼', required: true })
  page: number;

  @ApiProperty({ example: 10, description: '數量', required: true })
  size: number;

  @ApiProperty({ example: 1, description: '模型類型', required: true })
  keyType: number;

  @ApiProperty({
    example: 'dsadgadaorjoqm',
    description: '模型key',
    required: true,
  })
  key: string;

  @ApiProperty({
    example: true,
    description: '是否開啟當前key對應的模型',
    required: true,
  })
  status: boolean;

  @ApiProperty({
    example: 'gpt-3.5',
    description: '當前key綁定的模型是多少 需要調用的模型',
    required: true,
  })
  model: string;
}
