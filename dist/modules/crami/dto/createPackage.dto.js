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
exports.CreatePackageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePackageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '基礎套餐100次卡', description: '套餐名稱', required: true }),
    (0, class_validator_1.IsDefined)({ message: '套餐名稱是必傳參數' }),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '這是一個100次對話餘額的套餐，我們將為您額外贈送3次繪畫餘額，活動期間，我們將在套餐基礎上額外贈送您十次對話餘額和1次繪畫餘額',
        description: '套餐詳情描述',
        required: true,
    }),
    (0, class_validator_1.IsDefined)({ message: '套餐描述是必傳參數' }),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "des", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, default: 0, description: '套餐等級設置' }),
    (0, class_validator_1.IsNumber)({}, { message: '套餐等級權重必須為數字' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '套餐扣費類型 1：按次數 2：按Token', required: true }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "deductionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://xxxx.png', description: '套餐封面圖片' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "coverImg", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: '套餐排序、數字越大越靠前' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '套餐狀態 0：禁用 1：啟用', required: true }),
    (0, class_validator_1.IsNumber)({}, { message: '套餐狀態必須是Number' }),
    (0, class_validator_1.IsIn)([0, 1], { message: '套餐狀態錯誤' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, default: 0, description: '套餐有效期 -1為永久不過期' }),
    (0, class_validator_1.IsNumber)({}, { message: '套餐有效期天數類型必須是number' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, default: 0, description: '模型3對話次數' }),
    (0, class_validator_1.IsNumber)({}, { message: '模型3對話次數必須是number類型' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "model3Count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, default: 0, description: '模型4對話次數' }),
    (0, class_validator_1.IsNumber)({}, { message: '模型4對話次數必須是number類型' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "model4Count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, default: 0, description: 'MJ繪畫次數' }),
    (0, class_validator_1.IsNumber)({}, { message: 'MJ繪畫次數必須是number類型' }),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "drawMjCount", void 0);
exports.CreatePackageDto = CreatePackageDto;
