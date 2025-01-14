import { get, post } from '@/utils/request';

/* 查詢app分組 */
export function fetchQueryAppCatsAPI<T>(): Promise<T> {
  return get<T>({ url: '/app/queryCats' });
}

/*  查詢全量app列表 */
export function fetchQueryAppsAPI<T>(): Promise<T> {
  return get<T>({
    url: '/app/list',
  });
}

export function fetchSearchAppsAPI<T>(data: { keyword: string }): Promise<T> {
  return post<T>({
    url: '/app/searchList',
    data,
  });
}

/*  查詢個人app列表 */
export function fetchQueryMineAppsAPI<T>(): Promise<T> {
  return get<T>({
    url: '/app/mineApps',
  });
}

/* 收藏app */
export function fetchCollectAppAPI<T>(data: { appId: number }): Promise<T> {
  return post<T>({ url: '/app/collect', data });
}

/*  查詢全量app列表 */
export function fetchQueryOneCatAPI<T>(data): Promise<T> {
  return get<T>({
    url: '/app/queryOneCat',
    data,
  });
}
