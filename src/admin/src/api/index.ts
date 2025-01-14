import router from '@/router/index';
import useUserStore from '@/store/modules/user';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  baseURL:
    import.meta.env.DEV && import.meta.env.VITE_OPEN_PROXY === 'true'
      ? '/proxy/'
      : import.meta.env.VITE_APP_API_BASEURL,
  timeout: 1000 * 60,
  responseType: 'json',
});

api.interceptors.request.use((request) => {
  const userStore = useUserStore();
  /**
   * 全局攔截請求發送前遞交的參數
   * 以下代碼為示例，在請求頭裡帶上 token 資訊
   */
  if (userStore.isLogin && request.headers) {
    request.headers.Authorization = userStore.token
      ? `Bearer ${userStore.token}`
      : '';
  }
  // 是否將 POST 請求參數進行字串化處理
  if (request.method === 'post') {
    // request.data = qs.stringify(request.data, {
    //   arrayFormat: 'brackets',
    // })
  }
  return request;
});

api.interceptors.response.use(
  (response) => {
    /**
     * 全局攔截請求發送後返回的數據，如果數據有報錯則在這做全局的錯誤提示
     * 假設返回數據格式為：{ status: 1, error: '', data: '' }
     * 規則是當 status 為 1 時表示請求成功，為 0 時表示介面需要登錄或者登錄狀態失效，需要重新登錄
     * 請求出錯時 error 會返回錯誤資訊
     */
    return Promise.resolve(response.data);
  },
  (error) => {
    let msg = '';
    if (error?.response) {
      const { data, status } = error.response;
      if (status === 401) {
        msg = '權限驗證失敗，請重新登錄';
        // loginout
        if (data.code === 401 && data.message.includes('請登錄後繼續操作')) {
          const userStore = useUserStore();
          userStore.logout().then(() => {
            router.push({ name: 'login' });
          });
        }
      }
      const { message, code } = data;
      message && (msg = message);
    } else {
      msg = '介面請求異常，請稍後再試';
    }

    ElMessage({
      message: msg,
      type: 'error',
    });
    return Promise.reject(error);
  }
);

export default api;
