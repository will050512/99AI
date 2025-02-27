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
exports.UpdateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateUserDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cooper', nullable: true, description: '用戶名稱', required: false }),
    (0, class_validator_1.MinLength)(2, { message: '用戶名最低需要大於2位數！' }),
    (0, class_validator_1.MaxLength)(12, { message: '用戶名不得超過12位！' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶名不能為空！' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '', description: '用戶頭像', required: false }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶頭像不能為空！' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '我是一臺基於深度學習和自然語言處理技術的 AI 機器人，旨在為用戶提供高效、精準、個性化的智能服務。',
        description: '用戶簽名',
        required: false,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶簽名不能為空！' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "sign", void 0);
exports.UpdateUserDto = UpdateUserDto;
