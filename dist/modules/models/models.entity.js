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
exports.ModelsEntity = void 0;
const baseEntity_1 = require("../../common/entity/baseEntity");
const typeorm_1 = require("typeorm");
let ModelsEntity = class ModelsEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '模型類型 1: 普通對話 2: 繪畫  3:高級對話' }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "keyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型名稱' }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "modelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '綁定的模型是？' }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1024, comment: '模型頭像', nullable: true }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "modelAvatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型排序', default: 1 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "modelOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: '模型上下文支持的最大Token',
        default: 2000,
        nullable: true,
    }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "maxModelTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型上下文最大條數', nullable: true }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "maxRounds", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型上下文最大條數', nullable: true }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型單次調用扣除的次數', default: 1 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "deduct", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型扣除餘額類型 1: 普通模型 2: 高級模型', default: 1 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "deductType", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否使用token計費: 0:不是 1: 是', default: 0 }),
    __metadata("design:type", Boolean)
], ModelsEntity.prototype, "isTokenBased", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: '是否支持文件上傳: 0:不是 1: 附件鏈接格式 2: 4V格式',
        default: 0,
    }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "isFileUpload", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'token計費比例', default: 0 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "tokenFeeRatio", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型附加資訊', nullable: true }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型的key', nullable: true }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '使用的狀態: 0:禁用 1：啟用', default: 1 }),
    __metadata("design:type", Boolean)
], ModelsEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: 'key的狀態: 1:有效  -1:被封號 -2: 錯誤的秘鑰 -3: 餘額使用完了',
        default: 1,
    }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "keyStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'key的使用次數', default: 0 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "useCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'key的已經使用的token數量', default: 0 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "useToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '當前模型的代理地址', nullable: true }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "proxyUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型頻率限制 次/小時', default: 999 }),
    __metadata("design:type", Number)
], ModelsEntity.prototype, "modelLimits", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型介紹', nullable: true }),
    __metadata("design:type", String)
], ModelsEntity.prototype, "modelDescription", void 0);
ModelsEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'models' })
], ModelsEntity);
exports.ModelsEntity = ModelsEntity;
