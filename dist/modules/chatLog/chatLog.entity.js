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
exports.ChatLogEntity = void 0;
const baseEntity_1 = require("../../common/entity/baseEntity");
const typeorm_1 = require("typeorm");
let ChatLogEntity = class ChatLogEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶ID' }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '使用的模型', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: '使用類型1: 普通對話 2: 繪圖 3: 拓展性對話',
        nullable: true,
        default: 1,
    }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '自定義的模型名稱', nullable: true, default: 'AI' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "modelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '自定義的模型名稱', nullable: false, default: '' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "modelAvatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'Ip地址', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "curIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '詢問的問題', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '附加參數', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "extraParam", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '外掛參數', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "pluginParam", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '回答的答案', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '提問的token', nullable: true }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "promptTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '回答的token', nullable: true }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "completionTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '總花費的token', nullable: true }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "totalTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'role system user assistant', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '任務進度', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '任務狀態', nullable: true, default: 3 }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '任務類型', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '對圖片操作的按鈕ID', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "customId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '繪畫的ID每條不一樣', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "drawId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '文件資訊', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "fileInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '對話轉語音的鏈接', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "ttsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否推薦0: 默認 1: 推薦', nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "rec", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '分組ID', nullable: true }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '使用的應用id', nullable: true }),
    __metadata("design:type", Number)
], ChatLogEntity.prototype, "appId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否刪除', default: false }),
    __metadata("design:type", Boolean)
], ChatLogEntity.prototype, "isDelete", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '任務ID', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '任務數據', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "taskData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '視頻Url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '音頻Url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '提問參考', nullable: true }),
    __metadata("design:type", String)
], ChatLogEntity.prototype, "promptReference", void 0);
ChatLogEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'chatlog' })
], ChatLogEntity);
exports.ChatLogEntity = ChatLogEntity;
