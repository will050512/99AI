import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePassByOtherDto {
  @ApiProperty({ example: '666666', description: '三方用戶更新新密碼' })
  @IsNotEmpty({ message: '用戶密碼不能為空！' })
  @MinLength(6, { message: '用戶密碼最低需要大於6位數！' })
  @MaxLength(30, { message: '用戶密碼最長不能超過30位數！' })
  password: string;
}
