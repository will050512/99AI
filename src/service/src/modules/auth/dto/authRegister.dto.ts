import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({ example: 'cooper', description: '用戶名稱' })
  // @IsNotEmpty({ message: '用戶名不能為空！' })
  // @MinLength(2, { message: '用戶名最低需要大於2位數！' })
  // @MaxLength(12, { message: '用戶名不得超過12位！' })
  username?: string;

  @ApiProperty({ example: '123456', description: '用戶密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;

  @ApiProperty({ example: 'ai@aiweb.com', description: '用戶郵箱' })
  // @IsEmail({}, { message: '請填寫正確格式的郵箱！' })
  // @IsNotEmpty({ message: '郵箱不能為空！' })
  email: string;

  @ApiProperty({
    example: '',
    description: '用戶頭像',
    required: false,
  })
  @IsOptional()
  avatar: string;

  @ApiProperty({
    example: 'default',
    description: '用戶註冊來源',
    required: false,
  })
  @IsOptional()
  client: string;
}
