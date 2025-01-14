import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  // @ApiProperty({ example: '123456', description: '用戶舊密碼' })
  // @IsNotEmpty({ message: '用戶密碼不能為空！' })
  // @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  // @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  // oldPassword: string;

  @ApiProperty({ example: '666666', description: '用戶更新新密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空！' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;
}
