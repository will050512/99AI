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
exports.ConfigEntity = void 0;
const baseEntity_1 = require("../../common/entity/baseEntity");
const typeorm_1 = require("typeorm");
let ConfigEntity = class ConfigEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ length: 255, comment: '配置名稱', nullable: true }),
    __metadata("design:type", String)
], ConfigEntity.prototype, "configKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '配置內容', nullable: true }),
    __metadata("design:type", String)
], ConfigEntity.prototype, "configVal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: '配置是否公開，公開內容對前端項目展示  0：不公開 1：公開',
    }),
    __metadata("design:type", Number)
], ConfigEntity.prototype, "public", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: '配置是否加密，加密內容僅僅super權限可看 0：不加 1：加',
    }),
    __metadata("design:type", Number)
], ConfigEntity.prototype, "encry", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, comment: '配置狀態 0:關閉 1：啟用' }),
    __metadata("design:type", Number)
], ConfigEntity.prototype, "status", void 0);
ConfigEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'config' })
], ConfigEntity);
exports.ConfigEntity = ConfigEntity;
