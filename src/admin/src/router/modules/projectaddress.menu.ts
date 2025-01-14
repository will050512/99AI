import type { RouteRecordRaw } from 'vue-router';

function Layout() {
  return import('@/layouts/index.vue');
}

const routes: RouteRecordRaw = {
  path: '/github',
  component: () => import('@/views/ai/github-redirect.vue'), // 創建一個新的視圖文件用於處理跳轉邏輯
  name: 'ProjectAddressMenu',
  meta: {
    title: '開源地址', // 更改標題為 "GitHub應用"
    icon: 'mdi:github',
  },
};

export default routes;
