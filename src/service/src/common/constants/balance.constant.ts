export const ChatType = {
  NORMAL_CHAT: 1, // 普通對話
  PAINT: 2, // 繪圖
  EXTENDED_CHAT: 3, // 拓展性對話
};

/**
 * @description: 扣費類型
 * @param {type}
 * 1: 模型3 模型4 MJ  TODO 新版更新已經修改了 TYPE 這裡暫不處理
 */
// export const DeductionKey = {
//   BALANCE_TYPE: 'balance',
//   CHAT_TYPE: 'usesLeft',
//   PAINT_TYPE: 'paintCount',
// };

/**
 * @description: 賬戶充值類型
 * @param {type}
 * 1: 註冊贈送  2: 受邀請贈送  3: 邀請人贈送  4: 購買套餐贈送  5: 管理員贈送 6：掃碼支付 7: 繪畫失敗退款 8: 簽到獎勵
 */
export const RechargeType = {
  REG_GIFT: 1,
  INVITE_GIFT: 2,
  REFER_GIFT: 3,
  PACKAGE_GIFT: 4,
  ADMIN_GIFT: 5,
  SCAN_PAY: 6,
  DRAW_FAIL_REFUND: 7,
  SIGN_IN: 8,
};
