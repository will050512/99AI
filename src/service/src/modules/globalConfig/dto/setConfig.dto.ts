import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

interface KeyValue {
  configKey: string;
  configVal: any;
}

export class SetConfigDto {
  @ApiProperty({
    example: [{ configKey: 'siteName', configVal: 'AIWeb' }],
    description: '設置配置資訊',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Object)
  settings: KeyValue[];
}
