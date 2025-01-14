import type { Route } from '#/global';
import { systemRoutes } from '@/router/routes';
import { resolveRoutePath } from '@/utils';
import { cloneDeep } from 'lodash-es';
import type { RouteRecordRaw } from 'vue-router';
import useSettingsStore from './settings';

const useRouteStore = defineStore(
  // 唯一ID
  'route',
  () => {
    const settingsStore = useSettingsStore();

    const isGenerate = ref(false);
    const routesRaw = ref<Route.recordMainRaw[]>([]);
    const filesystemRoutesRaw = ref<RouteRecordRaw[]>([]);
    const currentRemoveRoutes = ref<(() => void)[]>([]);

    // 將多層嵌套路由處理成兩層，保留頂層和最子層路由，中間層級將被拍平
    function flatAsyncRoutes<T extends RouteRecordRaw>(route: T): T {
      if (route.children) {
        route.children = flatAsyncRoutesRecursive(
          route.children,
          [
            {
              path: route.path,
              title: route.meta?.title,
              icon: route.meta?.icon,
              hide: !route.meta?.breadcrumb && route.meta?.breadcrumb === false,
            },
          ],
          route.path
        );
      }
      return route;
    }
    function flatAsyncRoutesRecursive(
      routes: RouteRecordRaw[],
      breadcrumb: Route.breadcrumb[] = [],
      baseUrl = ''
    ): RouteRecordRaw[] {
      const res: RouteRecordRaw[] = [];
      routes.forEach((route) => {
        if (route.children) {
          const childrenBaseUrl = resolveRoutePath(baseUrl, route.path);
          const tmpBreadcrumb = cloneDeep(breadcrumb);
          tmpBreadcrumb.push({
            path: childrenBaseUrl,
            title: route.meta?.title,
            icon: route.meta?.icon,
            hide: !route.meta?.breadcrumb && route.meta?.breadcrumb === false,
          });
          const tmpRoute = cloneDeep(route);
          tmpRoute.path = childrenBaseUrl;
          if (!tmpRoute.meta) {
            tmpRoute.meta = {};
          }
          tmpRoute.meta.breadcrumbNeste = tmpBreadcrumb;
          delete tmpRoute.children;
          res.push(tmpRoute);
          const childrenRoutes = flatAsyncRoutesRecursive(
            route.children,
            tmpBreadcrumb,
            childrenBaseUrl
          );
          childrenRoutes.forEach((item) => {
            // 如果 path 一樣則覆蓋，因為子路由的 path 可能設置為空，導致和父路由一樣，直接註冊會提示路由重複
            if (res.some((v) => v.path === item.path)) {
              res.forEach((v, i) => {
                if (v.path === item.path) {
                  res[i] = item;
                }
              });
            } else {
              res.push(item);
            }
          });
        } else {
          const tmpRoute = cloneDeep(route);
          tmpRoute.path = resolveRoutePath(baseUrl, tmpRoute.path);
          // 處理麵包屑導航
          const tmpBreadcrumb = cloneDeep(breadcrumb);
          tmpBreadcrumb.push({
            path: tmpRoute.path,
            title: tmpRoute.meta?.title,
            icon: tmpRoute.meta?.icon,
            hide:
              !tmpRoute.meta?.breadcrumb && tmpRoute.meta?.breadcrumb === false,
          });
          if (!tmpRoute.meta) {
            tmpRoute.meta = {};
          }
          tmpRoute.meta.breadcrumbNeste = tmpBreadcrumb;
          res.push(tmpRoute);
        }
      });
      return res;
    }
    // 扁平化路由（將三級及以上路由數據拍平成二級）
    const flatRoutes = computed(() => {
      const returnRoutes: RouteRecordRaw[] = [];
      if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
        if (routesRaw.value) {
          routesRaw.value.forEach((item) => {
            const tmpRoutes = cloneDeep(item.children) as RouteRecordRaw[];
            tmpRoutes.map((v) => {
              if (!v.meta) {
                v.meta = {};
              }
              v.meta.auth = item.meta?.auth ?? v.meta?.auth;
              return v;
            });
            returnRoutes.push(...tmpRoutes);
          });
          returnRoutes.forEach((item) => flatAsyncRoutes(item));
        }
      } else {
        returnRoutes.push(
          ...(cloneDeep(filesystemRoutesRaw.value) as RouteRecordRaw[])
        );
      }
      return returnRoutes;
    });
    const flatSystemRoutes = computed(() => {
      const routes = [...systemRoutes];
      routes.forEach((item) => flatAsyncRoutes(item));
      return routes;
    });

    // TODO 將設置 meta.sidebar 的屬性轉換成 meta.menu ，過渡處理，未來將被棄用
    let isUsedDeprecatedAttribute = false;
    function converDeprecatedAttribute<T extends Route.recordMainRaw[]>(
      routes: T
    ): T {
      routes.forEach((route) => {
        route.children = converDeprecatedAttributeRecursive(route.children);
      });
      if (isUsedDeprecatedAttribute) {
        // turbo-console-disable-next-line
        console.warn(
          '[Fantastic-admin] 路由配置中的 "sidebar" 屬性即將被棄用, 請儘快替換為 "menu" 屬性'
        );
      }
      return routes;
    }
    function converDeprecatedAttributeRecursive(routes: RouteRecordRaw[]) {
      if (routes) {
        routes.forEach((route) => {
          if (typeof route.meta?.sidebar === 'boolean') {
            isUsedDeprecatedAttribute = true;
            route.meta.menu = route.meta.sidebar;
            delete route.meta.sidebar;
          }
          if (route.children) {
            converDeprecatedAttributeRecursive(route.children);
          }
        });
      }
      return routes;
    }

    // 生成路由（前端生成）
    function generateRoutesAtFront(asyncRoutes: Route.recordMainRaw[]) {
      // 設置 routes 數據
      routesRaw.value = converDeprecatedAttribute(
        cloneDeep(asyncRoutes) as any
      );
      isGenerate.value = true;
    }
    // 格式化後端路由數據
    function formatBackRoutes(
      routes: any,
      views = import.meta.glob('../../views/**/*.vue')
    ): Route.recordMainRaw[] {
      return routes.map((route: any) => {
        switch (route.component) {
          case 'Layout':
            route.component = () => import('@/layouts/index.vue');
            break;
          default:
            if (route.component) {
              route.component = views[`../../views/${route.component}`];
            } else {
              delete route.component;
            }
        }
        if (route.children) {
          route.children = formatBackRoutes(route.children, views);
        }
        return route;
      });
    }
    // 生成路由（後端獲取）
    // async function generateRoutesAtBack() {
    //   await apiApp.routeList().then((res) => {
    //     // 設置 routes 數據
    //     routesRaw.value = converDeprecatedAttribute(formatBackRoutes(res.data) as any)
    //     isGenerate.value = true
    //   }).catch(() => {})
    // }
    // 生成路由（文件系統生成）
    function generateRoutesAtFilesystem(asyncRoutes: RouteRecordRaw[]) {
      // 設置 routes 數據
      filesystemRoutesRaw.value = cloneDeep(asyncRoutes) as any;
      isGenerate.value = true;
    }
    // 記錄 accessRoutes 路由，用於登出時刪除路由
    function setCurrentRemoveRoutes(routes: (() => void)[]) {
      currentRemoveRoutes.value = routes;
    }
    // 清空動態路由
    function removeRoutes() {
      isGenerate.value = false;
      routesRaw.value = [];
      filesystemRoutesRaw.value = [];
      currentRemoveRoutes.value.forEach((removeRoute) => {
        removeRoute();
      });
      currentRemoveRoutes.value = [];
    }

    return {
      isGenerate,
      routesRaw,
      currentRemoveRoutes,
      flatRoutes,
      flatSystemRoutes,
      generateRoutesAtFront,
      // generateRoutesAtBack,
      generateRoutesAtFilesystem,
      setCurrentRemoveRoutes,
      removeRoutes,
    };
  }
);

export default useRouteStore;
