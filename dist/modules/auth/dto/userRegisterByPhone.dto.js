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
exports.UserRegisterByPhoneDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserRegisterByPhoneDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cooper', description: '用戶名稱' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶名不能為空！' }),
    (0, class_validator_1.MinLength)(2, { message: '用戶名最低需要大於2位數！' }),
    (0, class_validator_1.MaxLength)(12, { message: '用戶名不得超過12位！' }),
    __metadata("design:type", String)
], UserRegisterByPhoneDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: '用戶密碼' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用戶密碼不能為空' }),
    (0, class_validator_1.MinLength)(6, { message: '用戶密碼最低需要大於6位數！' }),
    (0, class_validator_1.MaxLength)(30, { message: '用戶密碼最長不能超過30位數！' }),
    __metadata("design:type", String)
], UserRegisterByPhoneDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '19999999999', description: '用戶手機號碼' }),
    (0, class_validator_1.IsPhoneNumber)('CN', { message: '手機號碼格式不正確！' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手機號碼不能為空！' }),
    __metadata("design:type", String)
], UserRegisterByPhoneDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '152546', description: '手機驗證碼' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手機驗證碼不能為空！' }),
    __metadata("design:type", String)
], UserRegisterByPhoneDto.prototype, "phoneCode", void 0);
exports.UserRegisterByPhoneDto = UserRegisterByPhoneDto;
