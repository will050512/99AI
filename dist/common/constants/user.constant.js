"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatusErrMsg = exports.UserStatusEnum = void 0;
var UserStatusEnum;
(function (UserStatusEnum) {
    UserStatusEnum[UserStatusEnum["PENDING"] = 0] = "PENDING";
    UserStatusEnum[UserStatusEnum["ACTIVE"] = 1] = "ACTIVE";
    UserStatusEnum[UserStatusEnum["LOCKED"] = 2] = "LOCKED";
    UserStatusEnum[UserStatusEnum["BLACKLISTED"] = 3] = "BLACKLISTED";
})(UserStatusEnum = exports.UserStatusEnum || (exports.UserStatusEnum = {}));
exports.UserStatusErrMsg = {
    [UserStatusEnum.PENDING]: '當前賬戶未激活,請前往郵箱驗證或重新發送驗證碼！',
    [UserStatusEnum.ACTIVE]: '當前賬戶已激活！',
    [UserStatusEnum.LOCKED]: '當前賬戶已鎖定,請聯繫管理員解鎖！',
    [UserStatusEnum.BLACKLISTED]: '當前賬戶已被永久封禁！',
};
