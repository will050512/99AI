import { IsNotEmpty, IsDefined, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserStatusDto {
	@ApiProperty({ example: 2, description: '用戶狀態', required: false })
	@IsNotEmpty({ message: '用戶狀態不能為空！' })
	@IsDefined({ message: '用戶狀態是必傳參數' })
	@IsIn([0, 1, 2, 3], { message: '非法參數、用戶狀態非法！' })
	status: number;

	@ApiProperty({ example: 1, description: '修改的用戶id', required: false })
	@IsDefined({ message: '用戶id是必傳參數' })
	id: number;
}
