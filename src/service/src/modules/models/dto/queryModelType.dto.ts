import { ApiProperty } from '@nestjs/swagger';

export class QueryModelTypeDto {
  @ApiProperty({ example: 1, description: '頁碼', required: true })
  page: number;

  @ApiProperty({ example: 10, description: '數量', required: true })
  size: number;

  @ApiProperty({ example: 1, description: '模型類型', required: true })
  keyType: number;

  @ApiProperty({ example: true, description: '是否開啟當前key對應的模型', required: true })
  status: boolean;
}
