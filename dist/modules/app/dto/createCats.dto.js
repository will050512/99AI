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
exports.CreateCatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCatsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '編程助手',
        description: 'app分類名稱',
        required: true,
    }),
    (0, class_validator_1.IsDefined)({ message: 'app分類名稱是必傳參數' }),
    __metadata("design:type", String)
], CreateCatsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: '分類排序、數字越大越靠前',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCatsDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '分類狀態 0：禁用 1：啟用',
        required: true,
    }),
    (0, class_validator_1.IsNumber)({}, { message: '狀態必須是Number' }),
    (0, class_validator_1.IsIn)([0, 1, 3, 4, 5], { message: '套餐狀態錯誤' }),
    __metadata("design:type", Number)
], CreateCatsDto.prototype, "status", void 0);
exports.CreateCatsDto = CreateCatsDto;
