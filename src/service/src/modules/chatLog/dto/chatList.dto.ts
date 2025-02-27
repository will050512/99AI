import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BaseEntity } from 'typeorm';

export class ChatListDto {
  @ApiProperty({ example: 1, description: '對話分組ID', required: false })
  @IsOptional()
  groupId: number;
}
