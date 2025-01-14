import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeletePackageDto {
	@ApiProperty({ example: 1, description: '要修改的套餐Id', required: true })
	@IsNumber({}, { message: '套餐ID必須是Number' })
	id: number;
}
