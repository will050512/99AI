/**
 * PENDING: 審核中
 * ACTIVE: 正常狀態
 * LOCKED: 賬號鎖定
 * BLACKLISTED: 黑名單賬號
 */
export enum UserStatusEnum {
  PENDING,
  ACTIVE,
  LOCKED,
  BLACKLISTED,
}

export const UserStatusErrMsg = {
  [UserStatusEnum.PENDING]: '當前賬戶未激活,請前往郵箱驗證或重新發送驗證碼！',
  [UserStatusEnum.ACTIVE]: '當前賬戶已激活！',
  [UserStatusEnum.LOCKED]: '當前賬戶已鎖定,請聯繫管理員解鎖！',
  [UserStatusEnum.BLACKLISTED]: '當前賬戶已被永久封禁！',
};
