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
exports.CreateAppDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAppDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '前端助手', description: 'app名稱', required: true }),
    (0, class_validator_1.IsDefined)({ message: 'app名稱是必傳參數' }),
    __metadata("design:type", String)
], CreateAppDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'app分類Id', required: true }),
    (0, class_validator_1.IsDefined)({ message: 'app分類Id必傳參數' }),
    __metadata("design:type", Number)
], CreateAppDto.prototype, "catId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '適用於編程編碼、期望成為您的編程助手',
        description: 'app名稱詳情描述',
        required: false,
    }),
    (0, class_validator_1.IsDefined)({ message: 'app名稱描述是必傳參數' }),
    __metadata("design:type", String)
], CreateAppDto.prototype, "des", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '你現在是一個翻譯官。接下來我說的所有話幫我翻譯成中文', description: '預設的prompt', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "preset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GPTs 的調用ID', description: 'GPTs 使用的 ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "gizmoID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否GPTs', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAppDto.prototype, "isGPTs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://xxxx.png', description: '套餐封面圖片', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "coverImg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: '套餐排序、數字越大越靠前', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAppDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '套餐狀態 0：禁用 1：啟用', required: true }),
    (0, class_validator_1.IsNumber)({}, { message: '套餐狀態必須是Number' }),
    (0, class_validator_1.IsIn)([0, 1, 3, 4, 5], { message: '套餐狀態錯誤' }),
    __metadata("design:type", Number)
], CreateAppDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '這是一句示例數據', description: 'app示例數據', required: false }),
    __metadata("design:type", String)
], CreateAppDto.prototype, "demoData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'system', description: '創建的角色', required: false }),
    __metadata("design:type", String)
], CreateAppDto.prototype, "role", void 0);
exports.CreateAppDto = CreateAppDto;
