import generatedRoutes from 'virtual:generated-pages';
import { setupLayouts } from 'virtual:meta-layouts';
import type { RouteRecordRaw } from 'vue-router';
import AppMenu from './modules/app.menu';
import ChatMenu from './modules/chat.menu';
import AiMenu from './modules/model.menu';
import PackageMenu from './modules/package.menu';
import PayMenu from './modules/pay.menu';
import { default as ProjectAddressMenu } from './modules/projectaddress.menu';
import SecureMenu from './modules/secure.menu';
import StorageMenu from './modules/storage.menu';
import SystemMenu from './modules/system.menu';
import UserMenu from './modules/user.menu';

import type { Route } from '#/global';
import useSettingsStore from '@/store/modules/settings';
import Home from '@/views/index.vue';

// 固定路由（默認路由）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: {
      title: '登錄',
    },
  },
  {
    path: '/:all(.*)*',
    name: 'notFound',
    component: () => import('@/views/[...all].vue'),
    meta: {
      title: '找不到頁面',
    },
  },
];

// 系統路由
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: () => useSettingsStore().settings.home.title,
      breadcrumb: false,
    },
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: {
          title: () => useSettingsStore().settings.home.title,
          breadcrumb: false,
        },
      },
      {
        path: 'reload',
        name: 'reload',
        component: () => import('@/views/reload.vue'),
        meta: {
          title: '重新加載',
          breadcrumb: false,
        },
      },
      {
        path: 'setting',
        name: 'personalSetting',
        component: () => import('@/views/personal/setting.vue'),
        meta: {
          title: '個人設置',
          cache: 'personalEditPassword',
        },
      },
      {
        path: 'edit/password',
        name: 'personalEditPassword',
        component: () => import('@/views/personal/edit.password.vue'),
        meta: {
          title: '修改密碼',
        },
      },
    ],
  },
];

// 動態路由（異步路由、導航欄路由）
const asyncRoutes: Route.recordMainRaw[] = [
  {
    // meta: {
    //   title: '演示',
    //   icon: 'sidebar-default',
    // },
    children: [
      SystemMenu,
      UserMenu,
      AiMenu,
      ChatMenu,
      AppMenu,
      SecureMenu,
      StorageMenu,
      PackageMenu,
      PayMenu,
      ProjectAddressMenu,
    ],
  },
];

const constantRoutesByFilesystem = generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant === true;
});

const asyncRoutesByFilesystem = setupLayouts(
  generatedRoutes.filter((item) => {
    return (
      item.meta?.enabled !== false &&
      item.meta?.constant !== true &&
      item.meta?.layout !== false
    );
  })
);

// 校驗 ProjectAddressMenu 是否存在，並且驗證其跳轉路徑
function validateProjectAddressMenu(routes: any[]) {
  const projectAddressRoute = routes.find((route) =>
    route.children?.includes(ProjectAddressMenu)
  );

  if (!projectAddressRoute) {
    return false;
  }

  // 驗證 ProjectAddressMenu 的具體路徑是否有效
  const projectAddressPath = ProjectAddressMenu.path;
  const projectAddressComponent = ProjectAddressMenu.component;

  // 這裡你可以添加更嚴格的校驗邏輯，例如檢查路徑格式、組件是否有效加載等
  if (!projectAddressPath || typeof projectAddressPath !== 'string') {
    return false;
  }
  if (
    !projectAddressComponent ||
    typeof projectAddressComponent !== 'function'
  ) {
    return false;
  }

  return true;
}

if (!validateProjectAddressMenu(asyncRoutes)) {
  // 顯示錯誤頁面或執行其他操作來停止應用程式運行
  document.body.innerHTML = '<h1></h1>';
  throw new Error('');
}

export {
  asyncRoutes,
  asyncRoutesByFilesystem,
  constantRoutes,
  constantRoutesByFilesystem,
  systemRoutes,
};
