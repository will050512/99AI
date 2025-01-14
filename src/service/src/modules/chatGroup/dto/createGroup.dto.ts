import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 10, description: '應用ID', required: false })
  @IsOptional()
  appId: number;

  @ApiProperty({
    example: '',
    description: '對話模型配置項序列化的字串',
    required: false,
  })
  modelConfig?: any;

  @ApiProperty({
    example: '',
    description: '對話組參數序列化的字串',
    required: false,
  })
  params?: string;
}
