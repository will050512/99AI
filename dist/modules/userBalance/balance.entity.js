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
exports.BalanceEntity = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../../common/entity/baseEntity");
let BalanceEntity = class BalanceEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶ID' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶賬戶餘額' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶使用次數餘額' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "usesLeft", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '繪畫使用次數餘額' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "paintCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, comment: '用戶總計使用的token數量' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "useTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, comment: '用戶總計使用的對話次數' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "useChats", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, comment: '用戶總計使用的繪畫次數' }),
    __metadata("design:type", Number)
], BalanceEntity.prototype, "usePaints", void 0);
BalanceEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'balance' })
], BalanceEntity);
exports.BalanceEntity = BalanceEntity;
