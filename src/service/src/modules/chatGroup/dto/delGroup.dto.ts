import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'typeorm';

export class DelGroupDto {
  @ApiProperty({ example: 1, description: '對話分組ID', required: true })
  groupId: number;
}
