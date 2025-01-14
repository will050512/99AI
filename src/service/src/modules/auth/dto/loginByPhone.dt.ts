import { IsNotEmpty, MinLength, MaxLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LoginByPhoneDto {
  @ApiProperty({ example: '19999999', description: '手機號' })
  @IsNotEmpty({ message: '手機號不能為空！' })
  @IsPhoneNumber('CN', { message: '手機號格式不正確！' })
  phone?: string;

  @ApiProperty({ example: '999999', description: '密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空！' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;
}
