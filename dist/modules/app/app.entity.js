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
exports.AppEntity = void 0;
const baseEntity_1 = require("../../common/entity/baseEntity");
const typeorm_1 = require("typeorm");
let AppEntity = class AppEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: 'App應用名稱' }),
    __metadata("design:type", String)
], AppEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App分類Id' }),
    __metadata("design:type", Number)
], AppEntity.prototype, "catId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用描述資訊' }),
    __metadata("design:type", String)
], AppEntity.prototype, "des", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用預設場景資訊', type: 'text' }),
    __metadata("design:type", String)
], AppEntity.prototype, "preset", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用封面圖片', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], AppEntity.prototype, "coverImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用排序、數字越大越靠前', default: 100 }),
    __metadata("design:type", Number)
], AppEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用是否啟用中 0：禁用 1：啟用', default: 1 }),
    __metadata("design:type", Number)
], AppEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App示例數據', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], AppEntity.prototype, "demoData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用角色 system  user', default: 'system' }),
    __metadata("design:type", String)
], AppEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用是否是GPTs', default: '0' }),
    __metadata("design:type", Number)
], AppEntity.prototype, "isGPTs", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用是否是固定使用模型', default: '0' }),
    __metadata("design:type", Number)
], AppEntity.prototype, "isFixedModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用使用的模型', type: 'text' }),
    __metadata("design:type", String)
], AppEntity.prototype, "appModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'GPTs 的調用ID', default: '' }),
    __metadata("design:type", String)
], AppEntity.prototype, "gizmoID", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App是否共享到應用廣場', default: false }),
    __metadata("design:type", Boolean)
], AppEntity.prototype, "public", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶Id', nullable: true }),
    __metadata("design:type", Number)
], AppEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否系統預留', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], AppEntity.prototype, "isSystemReserved", void 0);
AppEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'app' })
], AppEntity);
exports.AppEntity = AppEntity;
