import { ApiProperty } from '@nestjs/swagger';

export class SetModelTypeDto {
  @ApiProperty({ example: 1, description: 'model id', required: false })
  id: number;

  @ApiProperty({ example: 1, description: '模型類型', required: true })
  keyType: number;

  @ApiProperty({ example: '普通模型', description: '模型中文名稱', required: true })
  modelName: string;

  @ApiProperty({ example: true, description: '是否開啟當前key對應的模型', required: true })
  status: boolean;

  @ApiProperty({ example: 'gpt-3.5', description: '當前key綁定的模型是多少 需要調用的模型', required: true })
  model: string;

  @ApiProperty({ example: 300, description: '模型超時時間', required: false })
  timeout: number;

  @ApiProperty({ example: true, description: '扣費類型 1： 普通 2： 高級餘額', required: false })
  deductType: number;

  @ApiProperty({ example: true, description: '文件上傳類型 0 : 不使用 1: ALL類型 2: 4V類型', required: false })
  isFileUpload: number;

  @ApiProperty({ example: true, description: '單次扣除金額', required: false })
  deduct: number;

  @ApiProperty({ example: true, description: '排序id 越大越靠前', default: 100 })
  order: number;

  @ApiProperty({ example: 4000, description: '模型允許用戶使用的最大token設置過高意味著單次的上下文會很高控制模型上下文控制使用token數量', required: true })
  maxTokens: number;

  @ApiProperty({ example: 1000, description: '模型支持的最大回復TOken數量', required: true })
  maxResponseTokens: number;

  @ApiProperty({ example: true, description: '最大上下文輪次', required: false })
  maxRounds: number;

  @ApiProperty({ example: true, description: '是否設置為Dall-E3繪畫Key', required: false })
  isDallE3: boolean;

  @ApiProperty({ example: true, description: '是否設置為工具key', required: false })
  isUseTool: boolean;
}
