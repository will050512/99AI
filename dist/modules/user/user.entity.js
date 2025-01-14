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
exports.UserEntity = void 0;
const baseEntity_1 = require("../../common/entity/baseEntity");
const typeorm_1 = require("typeorm");
let UserEntity = class UserEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ length: 12, comment: '用戶暱稱' }),
    __metadata("design:type", String)
], UserEntity.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, comment: '用戶密碼', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, comment: '用戶狀態' }),
    __metadata("design:type", Number)
], UserEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, comment: '用戶性別' }),
    __metadata("design:type", Number)
], UserEntity.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true, comment: '用戶郵箱' }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true, comment: '用戶手機號' }),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 300,
        nullable: true,
        default: '',
        comment: '用戶頭像',
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 300,
        nullable: true,
        default: '我是一臺基於深度學習和自然語言處理技術的 AI 機器人，旨在為用戶提供高效、精準、個性化的智能服務。',
        comment: '用戶簽名',
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "sign", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, default: '', comment: '註冊IP', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "registerIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 64,
        default: '',
        comment: '最後一次登錄IP',
        nullable: true,
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "lastLoginIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '', comment: '用戶邀請碼' }),
    __metadata("design:type", String)
], UserEntity.prototype, "inviteCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '', comment: '用戶填寫的別人的邀請碼' }),
    __metadata("design:type", String)
], UserEntity.prototype, "invitedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'viewer', comment: '用戶角色' }),
    __metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, default: '', comment: '微信openId', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "openId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, comment: '用戶註冊來源', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶邀請鏈接被點擊次數', default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "inviteLinkCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶連續簽到天數', default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "consecutiveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶違規記錄次數', default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "violationCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '真實姓名', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "realName", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '身份證號', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "idCard", void 0);
UserEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], UserEntity);
exports.UserEntity = UserEntity;
