"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatCramiDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatCramiDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '套餐類型', required: true }),
    (0, class_validator_1.IsNumber)({}, { message: '套餐類型必須是number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatCramiDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '單次生成序號數量' }),
    (0, class_validator_1.IsNumber)({}, { message: '創建序號的張數數量' }),
    (0, class_validator_1.Max)(50, { message: '單次創建序號的張數數量不能超過50張' }),
    (0, class_validator_1.Min)(1, { message: '單次創建序號的張數數量不能少於1張' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatCramiDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: '序號攜帶模型3額度' }),
    (0, class_validator_1.IsNumber)({}, { message: '序號攜帶的餘額必須是number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatCramiDto.prototype, "model3Count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: '序號攜帶模型4額度' }),
    (0, class_validator_1.IsNumber)({}, { message: '序號攜帶額度類型必須是number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatCramiDto.prototype, "model4Count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: '序號攜帶MJ繪畫額度' }),
    (0, class_validator_1.IsNumber)({}, { message: '序號攜帶額度類型必須是number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatCramiDto.prototype, "drawMjCount", void 0);
exports.CreatCramiDto = CreatCramiDto;
