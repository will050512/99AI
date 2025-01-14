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
exports.OrderEntity = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../../common/entity/baseEntity");
let OrderEntity = class OrderEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '訂單ID', length: 64 }),
    __metadata("design:type", String)
], OrderEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '交易ID（服務商）', length: 32, nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "tradeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '支付平臺【epay|hupi|ltzf】）', length: 32, nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "payPlatform", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶ID', nullable: true }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '商品ID', nullable: true }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "goodsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '數量', default: 1 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '套餐價格NT$', type: 'decimal', scale: 0, precision: 10 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '訂單總金額', type: 'decimal', scale: 0, precision: 10 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '訂單狀態（0：未支付、1：已支付、2、支付失敗、3：支付超時）', default: 0 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', length: 0, nullable: true, comment: '支付時間' }),
    __metadata("design:type", Date)
], OrderEntity.prototype, "paydAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '支付渠道）', length: 32, nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "channel", void 0);
OrderEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'order' })
], OrderEntity);
exports.OrderEntity = OrderEntity;
