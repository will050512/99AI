import { IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SendPhoneCodeDto {
  @ApiProperty({ example: '199999999', description: '手機號' })
  @IsNotEmpty({ message: '手機號不能為空' })
  @MinLength(11, { message: '手機號長度為11位' })
  @MaxLength(11, { message: '手機號長度為11位！' })
  phone?: string;

  @ApiProperty({ example: '2b4i1b4', description: '圖形驗證碼KEY' })
  @IsNotEmpty({ message: '驗證碼KEY不能為空' })
  captchaId?: string;

  @ApiProperty({ example: '1g4d', description: '圖形驗證碼' })
  @IsNotEmpty({ message: '驗證碼不能為空' })
  captchaCode?: string;
}
