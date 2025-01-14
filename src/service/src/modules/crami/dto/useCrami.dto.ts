import { IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UseCramiDto {
	@ApiProperty({ example: 'ffar684rv254fs4f', description: '序號資訊', required: true })
	@IsDefined({ message: '套餐名稱是必傳參數' })
	code: string;
}
