import { get, post } from '@/utils/request';
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios';

/* 對話聊天 */
export function fetchChatAPIProcess<T = any>(params: {
  model: string;
  modelName: string;
  modelType: number;
  modelAvatar?: string;
  prompt: string;
  sslUrl?: string;
  chatId?: string;
  fileInfo?: string;
  action?: string;
  drawId?: string;
  customId?: string;
  appId?: number;
  extraParam?: { size?: string };
  usingPluginId?: number;
  options?: {
    groupId: number;
    usingNetwork: boolean;
  };
  signal?: GenericAbortSignal;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
}) {
  return post<T>({
    url: '/chatgpt/chat-process',
    data: {
      model: params.model,
      modelName: params.modelName,
      modelType: params.modelType,
      prompt: params.prompt,
      fileInfo: params?.fileInfo,
      extraParam: params?.extraParam,
      appId: params?.appId,
      options: params.options,
      action: params?.action,
      customId: params?.customId,
      usingPluginId: params?.usingPluginId,
      drawId: params?.drawId,
      modelAvatar: params?.modelAvatar,
    },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  });
}

export function fetchPptCoverAPIProcess<T>(data: {
  color?: string;
  style?: string;
  title: string;
}): Promise<T> {
  return post<T>({ url: '/chatgpt/ppt-cover', data }) as Promise<T>;
}

/* TTS 文字轉語音 */
export function fetchTtsAPIProces<T>(data: {
  chatId: number;
  prompt: string;
}): Promise<T> {
  return post<T>({ url: '/chatgpt/tts-process', data }) as Promise<T>;
}

/* 獲取個人資訊 */
export function fetchGetInfo<T>() {
  return get<T>({ url: '/auth/getInfo' });
}

/* 註冊 */
export function fetchRegisterAPI<T>(data: {
  username: string;
  password: string;
  contact: string;
  code: string;
}): Promise<T> {
  return post<T>({ url: '/auth/register', data }) as Promise<T>;
}

/* 登錄 */
export function fetchLoginAPI<T>(data: {
  username: string;
  password: string;
}): Promise<T> {
  return post<T>({ url: '/auth/login', data }) as Promise<T>;
}

/* 驗證碼登錄 */
export function fetchLoginWithCaptchaAPI<T>(data: {
  contact: string;
  code: string;
}): Promise<T> {
  return post<T>({ url: '/auth/loginWithCaptcha', data }) as Promise<T>;
}

/* 修改個人資訊 */
export function fetchUpdateInfoAPI<T>(data: {
  username?: string;
  avatar?: string;
}): Promise<T> {
  return post<T>({ url: '/user/update', data }) as Promise<T>;
}

/* 修改密碼 */
export function fetchUpdatePasswordAPI<T>(data: {
  password?: string;
}): Promise<T> {
  return post<T>({ url: '/auth/updatePassword', data }) as Promise<T>;
}

/* 同步對話 */
export function fetchGetchatSyncApi<T = any>(params: {
  prompt: string;
  options?: {
    conversationId?: string;
    parentMessageId?: string;
    temperature: number;
  };
  signal?: GenericAbortSignal;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
}) {
  return post<T>({
    url: '/chatgpt/chat-sync',
    data: { prompt: params.prompt, options: params.options },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  });
}

/* 獲取圖片驗證碼 */
export function fetchCaptchaImg<T>(data: { color: string }): Promise<T> {
  return post<T>({ url: '/auth/captcha', data }) as Promise<T>;
}

/* 發送郵箱驗證碼 */
export function fetchSendCode<T>(data: {
  contact: string;
  captchaCode: string;
}): Promise<T> {
  return post<T>({ url: '/auth/sendCode', data }) as Promise<T>;
}

/* 發送手機驗證碼 */
export function fetchSendSms<T>(data: { phone: string }): Promise<T> {
  return post<T>({ url: '/auth/sendPhoneCode', data }) as Promise<T>;
}

/* 發送郵箱驗證碼 */
export function fetchSendEmailCode<T>(data: {
  phone: string;
  captchaId: string;
  captchaCode: string;
}): Promise<T> {
  return post<T>({ url: '/auth/sendEmailCode', data }) as Promise<T>;
}
