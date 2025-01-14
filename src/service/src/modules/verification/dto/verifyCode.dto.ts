import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ example: '1', description: '驗證碼下發id' })
  @IsNotEmpty({ message: '缺少必要參數！' })
  id: number;

  @ApiProperty({ example: '15366754', description: '驗證碼' })
  @IsNotEmpty({ message: '驗證碼不能為空！' })
  code: number;
}
