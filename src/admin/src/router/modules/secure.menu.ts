import type { RouteRecordRaw } from 'vue-router';

function Layout() {
  return import('@/layouts/index.vue');
}

const routes: RouteRecordRaw = {
  path: '/secure',
  component: Layout,
  redirect: '/secure/sensitive-baidu',
  name: 'SecureMenu',
  meta: {
    title: '風控管理',
    icon: 'ri:secure-payment-line',
  },
  children: [
    {
      path: 'identity-verification',
      name: 'IdentityVerification',
      component: () => import('@/views/sensitive/identityVerification.vue'),
      meta: {
        title: '風控安全配置',
        icon: 'hugeicons:identification',
      },
    },
    {
      path: 'sensitive-violation',
      name: 'SensitiveViolationLog',
      component: () => import('@/views/sensitive/violation.vue'),
      meta: {
        title: '違規檢測記錄',
        icon: 'tabler:ban',
      },
    },
    {
      path: 'sensitive-baidu',
      name: 'SensitiveBaiduyun',
      component: () => import('@/views/sensitive/baiduSensitive.vue'),
      meta: {
        title: '百度雲敏感詞',
        icon: 'ri:baidu-line',
      },
    },
    {
      path: 'sensitive-custom',
      name: 'SensitiveCuston',
      component: () => import('@/views/sensitive/custom.vue'),
      meta: {
        title: '自定義敏感詞',
        icon: 'carbon:word-cloud',
      },
    },
  ],
};

export default routes;
