import { get, post } from '@/utils/request';

/* 刪除對話記錄 */
export function fetchDelChatLogAPI<T>(data: { id: number }): Promise<T> {
  return post<T>({
    url: '/chatlog/del',
    // url: '/chatlog/deleteChatsAfterId',
    data,
  });
}

/* 刪除一組對話記錄 */
export function fetchDelChatLogByGroupIdAPI<T>(data: {
  groupId: number;
}): Promise<T> {
  return post<T>({
    url: '/chatlog/delByGroupId',
    data,
  });
}

/* 刪除一組對話記錄 */
export function fetchDeleteGroupChatsAfterIdAPI<T>(data: {
  id: number;
}): Promise<T> {
  return post<T>({
    url: '/chatlog/deleteChatsAfterId',
    data,
  });
}

/* 查詢x組對話資訊 */
export function fetchQueryChatLogListAPI<T>(data: {
  groupId: number;
}): Promise<T> {
  return get<T>({
    url: '/chatlog/chatList',
    data,
  });
}

/* 查詢單個應用的對話資訊 */
export function fetchQueryChatLogByAppIdAPI<T>(data: {
  page?: number;
  size?: number;
  appId: number;
}): Promise<T> {
  return get<T>({
    url: '/chatlog/byAppId',
    data,
  });
}
