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
exports.UserBalanceEntity = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../../common/entity/baseEntity");
let UserBalanceEntity = class UserBalanceEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶ID' }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '充值的套餐包含的模型3次數', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "model3Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '充值的套餐包含的模型4次數', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "model4Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '充值的套餐包含的MJ繪畫次數', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "drawMjCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '當前使用的套餐ID', default: 0, nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '會員模型3額度', default: 0, nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "memberModel3Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '會員模型4額度', default: 0, nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "memberModel4Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '會員MJ繪畫額度', default: 0, nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "memberDrawMjCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '已經使用的對話3的模型次數', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "useModel3Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '已經使用的對話4的模型次數', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "useModel4Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '已經使用的對話3的模型Token', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "useModel3Token", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '已經使用的對話4的模型Token', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "useModel4Token", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '已經使用的MJ繪畫Token', nullable: true }),
    __metadata("design:type", Number)
], UserBalanceEntity.prototype, "useDrawMjToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '擴展字段', nullable: true }),
    __metadata("design:type", String)
], UserBalanceEntity.prototype, "extent", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '會員到期時間', nullable: true }),
    __metadata("design:type", Date)
], UserBalanceEntity.prototype, "expirationTime", void 0);
UserBalanceEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'user_balances' })
], UserBalanceEntity);
exports.UserBalanceEntity = UserBalanceEntity;
