import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/app',
  component: Layout,
  redirect: '/app/classify',
  name: 'AppMenu',
  meta: {
    title: '外掛應用',
    icon: 'tdesign:app',
  },
  children: [
    {
      path: 'visible',
      name: 'VisibleMenu',
      component: () => import('@/views/app/visible.vue'),
      meta: {
        title: '基礎設置',
        icon: 'tdesign:setting',
      },
    },
    {
      path: 'pluginmenu',
      name: 'PluginMenu',
      component: () => import('@/views/app/plugin.vue'),
      meta: {
        title: '外掛列表',
        icon: 'mingcute:plugin-2-line',
      },
    },
    {
      path: 'classify',
      name: 'AppMenuClassify',
      component: () => import('@/views/app/classify.vue'),
      meta: {
        title: '分類列表',
        icon: 'ph:list-fill',
      },
    },
    {
      path: 'application',
      name: 'Application',
      component: () => import('@/views/app/application.vue'),
      meta: {
        title: '應用列表',
        icon: 'clarity:vmw-app-line',
      },
    },
    // {
    //   path: 'pdf',
    //   name: 'pdfMenu',
    //   component: () => import('@/views/app/pdf.vue'),
    //   meta: {
    //     title: 'PDF 分析',
    //     icon: 'menu-visible',
    //   },
    // },
  ],
}

export default routes
