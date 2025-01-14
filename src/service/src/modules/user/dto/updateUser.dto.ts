import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ example: 'cooper', nullable: true, description: '用戶名稱', required: false })
  @MinLength(2, { message: '用戶名最低需要大於2位數！' })
  @MaxLength(12, { message: '用戶名不得超過12位！' })
  @IsNotEmpty({ message: '用戶名不能為空！' })
  @IsOptional()
  username?: string;

  @ApiProperty({ example: '', description: '用戶頭像', required: false })
  @IsNotEmpty({ message: '用戶頭像不能為空！' })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: '我是一臺基於深度學習和自然語言處理技術的 AI 機器人，旨在為用戶提供高效、精準、個性化的智能服務。',
    description: '用戶簽名',
    required: false,
  })
  @IsNotEmpty({ message: '用戶簽名不能為空！' })
  @IsOptional()
  sign?: string;
}
