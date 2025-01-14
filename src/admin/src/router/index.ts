import '@/assets/styles/nprogress.scss';
import { useNProgress } from '@vueuse/integrations/useNProgress';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

// 路由相關數據
import pinia from '@/store';
import useKeepAliveStore from '@/store/modules/keepAlive';
import useMenuStore from '@/store/modules/menu';
import useRouteStore from '@/store/modules/route';
import useSettingsStore from '@/store/modules/settings';
import useUserStore from '@/store/modules/user';
import {
  asyncRoutes,
  asyncRoutesByFilesystem,
  constantRoutes,
  constantRoutesByFilesystem,
} from './routes';

const { isLoading } = useNProgress();

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_BASE_PATH),
  routes:
    useSettingsStore(pinia).settings.app.routeBaseOn === 'filesystem'
      ? constantRoutesByFilesystem
      : (constantRoutes as RouteRecordRaw[]),
});

router.beforeEach(async (to, from, next) => {
  const settingsStore = useSettingsStore();
  const userStore = useUserStore();
  const routeStore = useRouteStore();
  const menuStore = useMenuStore();
  settingsStore.settings.app.enableProgress && (isLoading.value = true);
  // 是否已登錄
  if (userStore.isLogin) {
    // 是否已根據權限動態生成並註冊路由
    if (routeStore.isGenerate) {
      // 導航欄如果不是 single 模式，則需要根據 path 定位主導航的選中狀態
      settingsStore.settings.menu.menuMode !== 'single' &&
        menuStore.setActived(to.path);
      // 如果已登錄狀態下，進入登錄頁會強制跳轉到主頁
      if (to.name === 'login') {
        next({
          path: settingsStore.settings.home.fullPath,
          replace: true,
        });
      }
      // 如果未開啟主頁，但進入的是主頁，則會進入側邊欄導航第一個模塊
      else if (
        !settingsStore.settings.home.enable &&
        to.fullPath === settingsStore.settings.home.fullPath
      ) {
        if (menuStore.sidebarMenus.length > 0) {
          next({
            path: menuStore.sidebarMenusFirstDeepestPath,
            replace: true,
          });
        }
        // 如果側邊欄導航第一個模塊均無法命中，則還是進入主頁
        else {
          next();
        }
      }
      // 正常訪問頁面
      else {
        next();
      }
    } else {
      // 獲取用戶權限
      settingsStore.settings.app.enablePermission &&
        (await userStore.getPermissions());
      // 生成動態路由
      switch (settingsStore.settings.app.routeBaseOn) {
        case 'frontend':
          routeStore.generateRoutesAtFront(asyncRoutes);
          break;
        // case 'backend':
        //   await routeStore.generateRoutesAtBack()
        //   break
        case 'filesystem':
          routeStore.generateRoutesAtFilesystem(asyncRoutesByFilesystem);
          // 文件系統生成的路由，需要手動生成導航數據
          switch (settingsStore.settings.menu.baseOn) {
            case 'frontend':
              menuStore.generateMenusAtFront();
              break;
            // case 'backend':
            //   await menuStore.generateMenusAtBack()
            //   break
          }
          break;
      }
      // 註冊並記錄路由數據
      // 記錄的數據會在登出時會使用到，不使用 router.removeRoute 是考慮配置的路由可能不一定有設置 name ，則通過調用 router.addRoute() 返回的回調進行刪除
      const removeRoutes: (() => void)[] = [];
      routeStore.flatRoutes.forEach((route) => {
        if (!/^(?:https?:|mailto:|tel:)/.test(route.path)) {
          removeRoutes.push(router.addRoute(route as RouteRecordRaw));
        }
      });
      if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
        routeStore.flatSystemRoutes.forEach((route) => {
          removeRoutes.push(router.addRoute(route as RouteRecordRaw));
        });
      }
      routeStore.setCurrentRemoveRoutes(removeRoutes);
      // 動態路由生成並註冊後，重新進入當前路由
      next({
        path: to.path,
        query: to.query,
        replace: true,
      });
    }
  } else {
    if (to.name !== 'login') {
      next({
        name: 'login',
        query: {
          redirect:
            to.fullPath !== settingsStore.settings.home.fullPath
              ? to.fullPath
              : undefined,
        },
      });
    } else {
      next();
    }
  }
});

router.afterEach((to, from) => {
  const settingsStore = useSettingsStore();
  const keepAliveStore = useKeepAliveStore();
  settingsStore.settings.app.enableProgress && (isLoading.value = false);
  // 設置頁面 title
  if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
    settingsStore.setTitle(
      to.meta.breadcrumbNeste?.at(-1)?.title ?? to.meta.title
    );
  } else {
    settingsStore.setTitle(to.meta.title);
  }
  /**
   * 處理普通頁面的緩存
   */
  // 判斷當前頁面是否開啟緩存，如果開啟，則將當前頁面的 name 資訊存入 keep-alive 全局狀態
  if (to.meta.cache) {
    const componentName = to.matched.at(-1)?.components?.default.name;
    if (componentName) {
      keepAliveStore.add(componentName);
    } else {
      // turbo-console-disable-next-line
      console.warn(
        '[Fantastic-admin] 該頁面組件未設置組件名，會導致緩存失效，請檢查'
      );
    }
  }
  // 判斷離開頁面是否開啟緩存，如果開啟，則根據緩存規則判斷是否需要清空 keep-alive 全局狀態裡離開頁面的 name 資訊
  if (from.meta.cache) {
    const componentName = from.matched.at(-1)?.components?.default.name;
    if (componentName) {
      // 通過 meta.cache 判斷針對哪些頁面進行緩存
      switch (typeof from.meta.cache) {
        case 'string':
          if (from.meta.cache !== to.name) {
            keepAliveStore.remove(componentName);
          }
          break;
        case 'object':
          if (!from.meta.cache.includes(to.name as string)) {
            keepAliveStore.remove(componentName);
          }
          break;
      }
      // 通過 meta.noCache 判斷針對哪些頁面不需要進行緩存
      if (from.meta.noCache) {
        switch (typeof from.meta.noCache) {
          case 'string':
            if (from.meta.noCache === to.name) {
              keepAliveStore.remove(componentName);
            }
            break;
          case 'object':
            if (from.meta.noCache.includes(to.name as string)) {
              keepAliveStore.remove(componentName);
            }
            break;
        }
      }
      // 如果進入的是 reload 頁面，則也將離開頁面的緩存清空
      if (to.name === 'reload') {
        keepAliveStore.remove(componentName);
      }
    }
  }
  document.documentElement.scrollTop = 0;
});

export default router;
