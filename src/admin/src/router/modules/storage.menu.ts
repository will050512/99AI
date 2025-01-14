import type { RouteRecordRaw } from 'vue-router';

function Layout() {
  return import('@/layouts/index.vue');
}

const routes: RouteRecordRaw = {
  path: '/storage',
  component: Layout,
  redirect: '/storage/config',
  name: 'StorageMenu',
  meta: {
    title: '儲存配置',
    icon: 'mingcute:storage-line',
  },
  children: [
    {
      path: 'localStorage',
      name: 'LocalStorage',
      component: () => import('@/views/storage/localStorage.vue'),
      meta: {
        title: '本地儲存',
        icon: 'icon-park-outline:cloud-storage',
      },
    },
    {
      path: 'tencent',
      name: 'StorageTencent',
      component: () => import('@/views/storage/tencent.vue'),
      meta: {
        title: '騰訊雲COS',
        icon: 'teenyicons:cost-estimate-outline',
      },
    },
    {
      path: 'ali',
      name: 'StorageAli',
      component: () => import('@/views/storage/ali.vue'),
      meta: {
        title: '阿里雲OSS',
        icon: 'material-symbols:home-storage-outline',
      },
    },
    {
      path: 'chevereto',
      name: 'StorageChevereto',
      component: () => import('@/views/storage/chevereto.vue'),
      meta: {
        title: 'chevereto圖床',
        icon: 'material-symbols:image-outline',
      },
    },
  ],
};

export default routes;
