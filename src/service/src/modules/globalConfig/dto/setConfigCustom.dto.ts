import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

interface KeyValue {
  configKey: string;
  configVal: any;
  infoKey: string;
}

export class SetConfigCustomDto {
  @ApiProperty({
    example: { configKey: 'siteName', configVal: 'AIWeb', infoKey: 'AIWeb' },
    description: '設置更新配置資訊',
  })
  @ValidateNested({ each: true })
  @Type(() => Object)
  settings: KeyValue;
}
