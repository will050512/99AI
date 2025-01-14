import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ example: 'super', description: '郵箱' })
  @IsNotEmpty({ message: '用戶名不能為空！' })
  @MinLength(2, { message: '用戶名最短是兩位數！' })
  @MaxLength(30, { message: '用戶名最長不得超過30位！' })
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 1, description: '用戶ID' })
  @IsOptional()
  uid?: number;

  @ApiProperty({ example: '999999', description: '密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空！' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;
}
