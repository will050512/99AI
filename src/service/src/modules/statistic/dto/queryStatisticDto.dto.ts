import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryStatisticDto {
	@ApiProperty({ example: 7, description: '查詢最近N天的數據', required: true })
	days: number;
}
