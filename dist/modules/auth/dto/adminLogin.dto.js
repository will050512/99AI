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
exports.AdminLoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AdminLoginDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'super', description: '郵箱' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶名不能為空！' }),
    (0, class_validator_1.MinLength)(2, { message: '用戶名最短是兩位數！' }),
    (0, class_validator_1.MaxLength)(30, { message: '用戶名最長不得超過30位！' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '999999', description: '密碼' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶密碼不能為空！' }),
    (0, class_validator_1.MinLength)(6, { message: '用戶密碼最低需要大於6位數！' }),
    (0, class_validator_1.MaxLength)(30, { message: '用戶密碼最長不能超過30位數！' }),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "password", void 0);
exports.AdminLoginDto = AdminLoginDto;
