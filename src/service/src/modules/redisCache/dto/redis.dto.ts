import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RedisDto {
	@ApiProperty({ example: 'name', description: '郵箱' })
	key: string;

	@ApiProperty({ example: '123456', description: '密碼' })
	@IsNotEmpty({ message: '用戶密碼不能為空！' })
	val: string;
}
