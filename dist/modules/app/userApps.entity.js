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
exports.UserAppsEntity = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../../common/entity/baseEntity");
let UserAppsEntity = class UserAppsEntity extends baseEntity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ comment: '用戶ID' }),
    __metadata("design:type", Number)
], UserAppsEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '應用ID' }),
    __metadata("design:type", Number)
], UserAppsEntity.prototype, "appId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '應用分類ID' }),
    __metadata("design:type", Number)
], UserAppsEntity.prototype, "catId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'app類型 system/user', default: 'user' }),
    __metadata("design:type", String)
], UserAppsEntity.prototype, "appType", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否公開到公告菜單', default: false }),
    __metadata("design:type", Boolean)
], UserAppsEntity.prototype, "public", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'app狀態 1正常 2審核 3違規', default: 1 }),
    __metadata("design:type", Number)
], UserAppsEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'App應用排序、數字越大越靠前', default: 100 }),
    __metadata("design:type", Number)
], UserAppsEntity.prototype, "order", void 0);
UserAppsEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'user_apps' })
], UserAppsEntity);
exports.UserAppsEntity = UserAppsEntity;
