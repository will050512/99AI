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
exports.SendPhoneCodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendPhoneCodeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '199999999', description: '手機號' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手機號不能為空' }),
    (0, class_validator_1.MinLength)(11, { message: '手機號長度為11位' }),
    (0, class_validator_1.MaxLength)(11, { message: '手機號長度為11位！' }),
    __metadata("design:type", String)
], SendPhoneCodeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2b4i1b4', description: '圖形驗證碼KEY' }),
    (0, class_validator_1.IsNotEmpty)({ message: '驗證碼KEY不能為空' }),
    __metadata("design:type", String)
], SendPhoneCodeDto.prototype, "captchaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1g4d', description: '圖形驗證碼' }),
    (0, class_validator_1.IsNotEmpty)({ message: '驗證碼不能為空' }),
    __metadata("design:type", String)
], SendPhoneCodeDto.prototype, "captchaCode", void 0);
exports.SendPhoneCodeDto = SendPhoneCodeDto;
