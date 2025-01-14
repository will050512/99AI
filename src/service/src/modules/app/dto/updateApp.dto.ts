import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional, Max, Min, ValidateNested, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateAppDto } from './createApp.dto';

export class UpdateAppDto extends CreateAppDto {
  @ApiProperty({ example: 1, description: '要修改的分類Id', required: true })
  @IsNumber({}, { message: '分類ID必須是Number' })
  id: number;
}
