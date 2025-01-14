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
exports.ChatDrawDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ChatDrawDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Draw a cute little dog', description: '繪畫描述資訊' }),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '繪畫張數', required: true }),
    __metadata("design:type", Number)
], ChatDrawDto.prototype, "n", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1024x1024', description: '圖片尺寸', required: true }),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'standard', description: '圖片質量', required: true }),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'close-up polaroid photo, of a little joyful cute panda, in the forest, sun rays coming, photographic, sharp focus, depth of field, soft lighting, heigh quality, 24mm, Nikon Z FX',
        description: '繪畫提示詞！',
        required: true,
    }),
    (0, swagger_1.ApiProperty)({ example: '--ar 16:9 --c 0', description: '除了prompt的額外參數' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "extraParam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://xsdasdasd.com', description: '墊圖圖片地址' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "imgUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'IMAGINE', description: '任務類型,可用值:IMAGINE,UPSCALE,VARIATION,ZOOM,PAN,DESCRIBE,BLEND,SHORTEN,SWAP_FACE' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '變體或者放大的序號' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ChatDrawDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '繪畫的DBID' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ChatDrawDto.prototype, "drawId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'customId' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "customId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'base64' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatDrawDto.prototype, "base64", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '任務ID' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ChatDrawDto.prototype, "taskId", void 0);
exports.ChatDrawDto = ChatDrawDto;
