import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
  IsDefined,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatCramiDto {
  @ApiProperty({ example: 1, description: '套餐類型', required: true })
  @IsNumber({}, { message: '套餐類型必須是number' })
  @IsOptional()
  packageId: number;

  @ApiProperty({ example: 1, description: '單次生成序號數量' })
  @IsNumber({}, { message: '創建序號的張數數量' })
  @Max(50, { message: '單次創建序號的張數數量不能超過50張' })
  @Min(1, { message: '單次創建序號的張數數量不能少於1張' })
  @IsOptional()
  count: number;

  @ApiProperty({ example: 0, description: '序號攜帶模型3額度' })
  @IsNumber({}, { message: '序號攜帶的餘額必須是number' })
  @IsOptional()
  model3Count: number;

  @ApiProperty({ example: 100, description: '序號攜帶模型4額度' })
  @IsNumber({}, { message: '序號攜帶額度類型必須是number' })
  @IsOptional()
  model4Count: number;

  @ApiProperty({ example: 3, description: '序號攜帶MJ繪畫額度' })
  @IsNumber({}, { message: '序號攜帶額度類型必須是number' })
  @IsOptional()
  drawMjCount: number;
}
