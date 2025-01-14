import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({ example: 1, description: '修改的對話ID', required: false })
  @IsOptional()
  groupId: number;

  @ApiProperty({ example: 10, description: '對話組title', required: false })
  @IsOptional()
  title: string;

  @ApiProperty({ example: 10, description: '對話組是否置頂', required: false })
  @IsOptional()
  isSticky: boolean;

  @ApiProperty({ example: '', description: '對話組文件地址', required: false })
  @IsOptional()
  fileUrl: string;

  @ApiProperty({
    example: '',
    description: '對話模型配置項序列化的字串',
    required: false,
  })
  config: string;
}
