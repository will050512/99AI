export enum ErrorMessageEnum {
  USERNAME_OR_EMAIL_ALREADY_REGISTERED = '用戶名或郵箱已註冊！',
  USER_NOT_FOUND = '用戶不存在！',
  VERIFICATION_NOT_FOUND = '驗證記錄不存在！',
  VERIFICATION_CODE_EXPIRED = '驗證碼已過期！',
  VERIFICATION_CODE_INVALID = '驗證碼無效！',
  VERIFICATION_CODE_MISMATCH = '驗證碼不匹配！',
  VERIFICATION_CODE_SEND_FAILED = '驗證碼發送失敗！',
  VERIFICATION_CODE_SEND_TOO_OFTEN = '驗證碼發送過於頻繁！',
}

export const OpenAiErrorCodeMessage: Record<string, string> = {
  400: '[Inter Error] 服務端錯誤[400]',
  401: '[Inter Error] 服務出現錯誤、請稍後再試一次吧[401]',
  403: '[Inter Error] 服務器拒絕訪問，請稍後再試 | Server refused to access, please try again later',
  429: '[Inter Error] 當前key調用頻率過高、請重新對話再試一次吧[429]',
  502: '[Inter Error] 錯誤的網關 |  Bad Gateway[502]',
  503: '[Inter Error] 服務器繁忙，請稍後再試 | Server is busy, please try again later[503]',
  504: '[Inter Error] 網關超時 | Gateway Time-out[504]',
  500: '[Inter Error] 服務器繁忙，請稍後再試 | Internal Server Error[500]',
};
