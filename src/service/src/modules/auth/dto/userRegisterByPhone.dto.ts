import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserRegisterByPhoneDto {
  @ApiProperty({ example: 'cooper', description: '用戶名稱' })
  @IsNotEmpty({ message: '用戶名不能為空！' })
  @MinLength(2, { message: '用戶名最低需要大於2位數！' })
  @MaxLength(12, { message: '用戶名不得超過12位！' })
  username?: string;

  @ApiProperty({ example: '123456', description: '用戶密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;

  @ApiProperty({ example: '19999999999', description: '用戶手機號碼' })
  @IsPhoneNumber('CN', { message: '手機號碼格式不正確！' })
  @IsNotEmpty({ message: '手機號碼不能為空！' })
  phone: string;

  @ApiProperty({ example: '152546', description: '手機驗證碼' })
  @IsNotEmpty({ message: '手機驗證碼不能為空！' })
  phoneCode: string;
}
