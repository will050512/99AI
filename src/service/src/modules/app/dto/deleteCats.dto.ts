import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteCatsDto {
	@ApiProperty({ example: 1, description: '要刪除app分類Id', required: true })
	@IsNumber({}, { message: 'ID必須是Number' })
	id: number;
}
