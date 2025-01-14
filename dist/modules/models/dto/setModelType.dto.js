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
exports.SetModelTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SetModelTypeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'model id', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '模型類型', required: true }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "keyType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '普通模型', description: '模型中文名稱', required: true }),
    __metadata("design:type", String)
], SetModelTypeDto.prototype, "modelName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '是否開啟當前key對應的模型', required: true }),
    __metadata("design:type", Boolean)
], SetModelTypeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'gpt-3.5', description: '當前key綁定的模型是多少 需要調用的模型', required: true }),
    __metadata("design:type", String)
], SetModelTypeDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300, description: '模型超時時間', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '扣費類型 1： 普通 2： 高級餘額', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "deductType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '文件上傳類型 0 : 不使用 1: ALL類型 2: 4V類型', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "isFileUpload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '單次扣除金額', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "deduct", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '排序id 越大越靠前', default: 100 }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4000, description: '模型允許用戶使用的最大token設置過高意味著單次的上下文會很高控制模型上下文控制使用token數量', required: true }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "maxTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: '模型支持的最大回復TOken數量', required: true }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "maxResponseTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '最大上下文輪次', required: false }),
    __metadata("design:type", Number)
], SetModelTypeDto.prototype, "maxRounds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '是否設置為Dall-E3繪畫Key', required: false }),
    __metadata("design:type", Boolean)
], SetModelTypeDto.prototype, "isDallE3", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '是否設置為工具key', required: false }),
    __metadata("design:type", Boolean)
], SetModelTypeDto.prototype, "isUseTool", void 0);
exports.SetModelTypeDto = SetModelTypeDto;
