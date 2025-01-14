import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAutoReplyDto {
	@ApiProperty({ example: 1, description: '查詢頁數', required: false })
	@IsOptional()
	page: number;

	@ApiProperty({ example: 10, description: '每頁數量', required: false })
	@IsOptional()
	size: number;

	@ApiProperty({ example: '你是誰', description: '提問問題', required: false })
	@IsOptional()
	prompt: string;

	@ApiProperty({ example: 1, description: '問題狀態', required: false })
	@IsOptional()
	status: number;
}
