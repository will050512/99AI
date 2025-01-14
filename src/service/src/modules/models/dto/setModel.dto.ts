import { ApiProperty } from '@nestjs/swagger';

export class SetModelDto {
  @ApiProperty({ example: 1, description: 'key id', required: false })
  id: number;

  @ApiProperty({ example: 1, description: '模型類型', required: true })
  keyType: number;

  @ApiProperty({ example: '默認', description: '模型中文名稱', required: true })
  modelName: string;

  @ApiProperty({ example: 'sk-', description: '模型key', required: false })
  key: any;

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

  @ApiProperty({ example: 1, description: '模型排序' })
  modelOrder: number;

  @ApiProperty({ example: 'https://***.png', required: false })
  modelAvatar: string;

  @ApiProperty({
    example: 4096,
    description: '模型支持的最大TOken數量',
    required: false,
  })
  maxModelTokens: number;

  @ApiProperty({
    example: true,
    description: '模型的代理地址',
    required: false,
  })
  proxyUrl: string;

  @ApiProperty({ example: 300, description: '模型超時時間', required: false })
  timeout: number;

  @ApiProperty({ example: true, description: 'key狀態', required: false })
  keyStatus: number;

  @ApiProperty({
    example: true,
    description: '扣費類型 1： 普通 2： 高級餘額',
    required: false,
  })
  deductType: number;

  @ApiProperty({ example: true, description: '單次扣除金額', required: false })
  deduct: number;

  @ApiProperty({
    example: true,
    description: '最大上下文輪次',
    required: false,
  })
  maxRounds: number;

  @ApiProperty({
    example: true,
    description: '是否設置為繪畫Key',
    required: false,
  })
  isDraw: boolean;

  @ApiProperty({
    example: true,
    description: '是否支持文件上傳',
    required: false,
  })
  isFileUpload: number;

  @ApiProperty({
    example: true,
    description: '是否使用token計費',
    required: false,
  })
  isTokenBased: boolean;

  @ApiProperty({ example: true, description: 'token計費比例', required: false })
  tokenFeeRatio: number;
}
