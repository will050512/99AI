import { get, post } from '@/utils/request';

/* 創建新的對話組 */
export function fetchCreateGroupAPI<T>(data?: {
  appId?: number;
  modelConfig?: any;
  params?: string;
}): Promise<T> {
  return post<T>({
    url: '/group/create',
    data,
  });
}

/* 查詢對話組列表 */
export function fetchQueryGroupAPI<T>(): Promise<T> {
  return get<T>({ url: '/group/query' });
}

/* 通過groupId查詢當前對話組的詳細資訊 */
export function fetchGroupInfoById<T>(groupId: number | string): Promise<T> {
  return get<T>({ url: `/group/info/${groupId}` });
}

/* 修改對話組 */
export function fetchUpdateGroupAPI<T>(data?: {
  groupId?: number;
  title?: string;
  isSticky?: boolean;
  config?: string;
  fileUrl?: string;
}): Promise<T> {
  return post<T>({
    url: '/group/update',
    data,
  });
}

/* 刪除對話組 */
export function fetchDelGroupAPI<T>(data?: { groupId: number }): Promise<T> {
  return post<T>({
    url: '/group/del',
    data,
  });
}

/* 刪除全部對話組 */
export function fetchDelAllGroupAPI<T>(data?: { groupId: number }): Promise<T> {
  return post<T>({
    url: '/group/delAll',
    data,
  });
}
