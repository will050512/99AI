import { IsNotEmpty, MinLength, MaxLength, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBadWordsDto {
	@ApiProperty({ example: 1, description: '敏感詞id', required: true })
	@IsOptional()
	id: number;

	@ApiProperty({ example: 'test', description: '敏感詞內容', required: false })
	@IsOptional()
	word: string;

	@ApiProperty({ example: 1, description: '關鍵詞狀態', required: false })
	@IsOptional()
	status: number;
}
