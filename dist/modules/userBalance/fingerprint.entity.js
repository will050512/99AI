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
exports.FingerprintLogEntity = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../../common/entity/baseEntity");
let FingerprintLogEntity = class FingerprintLogEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '指紋ID' }),
    __metadata("design:type", String)
], FingerprintLogEntity.prototype, "fingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型3對話次數' }),
    __metadata("design:type", Number)
], FingerprintLogEntity.prototype, "model3Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模型4對話次數' }),
    __metadata("design:type", Number)
], FingerprintLogEntity.prototype, "model4Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'MJ繪畫次數' }),
    __metadata("design:type", Number)
], FingerprintLogEntity.prototype, "drawMjCount", void 0);
FingerprintLogEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'fingerprint_log' })
], FingerprintLogEntity);
exports.FingerprintLogEntity = FingerprintLogEntity;
