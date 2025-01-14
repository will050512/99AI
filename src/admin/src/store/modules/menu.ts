import type { Menu, Route } from '#/global';
import menu from '@/menu';
import { resolveRoutePath } from '@/utils';
import { cloneDeep } from 'lodash-es';
import type { RouteRecordRaw } from 'vue-router';
import useRouteStore from './route';
import useSettingsStore from './settings';
import useUserStore from './user';

const useMenuStore = defineStore(
  // 唯一ID
  'menu',
  () => {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const routeStore = useRouteStore();

    const filesystemMenusRaw = ref<Menu.recordMainRaw[]>([]);
    const actived = ref(0);

    // 將原始路由轉換成導航菜單
    function convertRouteToMenu(
      routes: Route.recordMainRaw[]
    ): Menu.recordMainRaw[] {
      const returnMenus: Menu.recordMainRaw[] = [];
      routes.forEach((item) => {
        if (settingsStore.settings.menu.menuMode === 'single') {
          returnMenus.length === 0 &&
            returnMenus.push({
              meta: {},
              children: [],
            });
          returnMenus[0].children.push(
            ...convertRouteToMenuRecursive(item.children)
          );
        } else {
          const menuItem: Menu.recordMainRaw = {
            meta: {
              title: item?.meta?.title,
              icon: item?.meta?.icon,
              auth: item?.meta?.auth,
            },
            children: [],
          };
          menuItem.children = convertRouteToMenuRecursive(item.children);
          returnMenus.push(menuItem);
        }
      });
      return returnMenus;
    }
    function convertRouteToMenuRecursive(
      routes: RouteRecordRaw[],
      basePath = ''
    ): Menu.recordRaw[] {
      const returnMenus: Menu.recordRaw[] = [];
      routes.forEach((item) => {
        const menuItem: Menu.recordRaw = {
          path: resolveRoutePath(basePath, item.path),
          meta: {
            title: item?.meta?.title,
            icon: item?.meta?.icon,
            defaultOpened: item?.meta?.defaultOpened,
            auth: item?.meta?.auth,
            menu: item?.meta?.menu,
            link: item?.meta?.link,
          },
        };
        if (item.children) {
          menuItem.children = convertRouteToMenuRecursive(
            item.children,
            menuItem.path
          );
        }
        returnMenus.push(menuItem);
      });
      return returnMenus;
    }

    // 完整導航數據
    const allMenus = computed(() => {
      let returnMenus: Menu.recordMainRaw[] = [];
      if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
        returnMenus = convertRouteToMenu(routeStore.routesRaw);
      } else {
        returnMenus = filesystemMenusRaw.value;
      }
      // 如果權限功能開啟，則需要對導航數據進行篩選過濾
      if (settingsStore.settings.app.enablePermission) {
        returnMenus = filterAsyncMenus(returnMenus, userStore.permissions);
      }
      return returnMenus;
    });
    // 次導航數據
    const sidebarMenus = computed<Menu.recordMainRaw['children']>(() => {
      return allMenus.value.length > 0
        ? allMenus.value.length > 1
          ? allMenus.value[actived.value].children
          : allMenus.value[0].children
        : [];
    });
    // 次導航第一層最深路徑
    const sidebarMenusFirstDeepestPath = computed(() => {
      return sidebarMenus.value.length > 0
        ? getDeepestPath(sidebarMenus.value[0])
        : settingsStore.settings.home.fullPath;
    });
    function getDeepestPath(menu: Menu.recordRaw, rootPath = '') {
      let retnPath = '';
      if (menu.children) {
        const item = menu.children.find((item) => item.meta?.menu !== false);
        if (item) {
          retnPath = getDeepestPath(
            item,
            resolveRoutePath(rootPath, menu.path)
          );
        } else {
          retnPath = getDeepestPath(
            menu.children[0],
            resolveRoutePath(rootPath, menu.path)
          );
        }
      } else {
        retnPath = resolveRoutePath(rootPath, menu.path);
      }
      return retnPath;
    }
    // 默認展開的導航路徑
    const defaultOpenedPaths = computed(() => {
      const defaultOpenedPaths: string[] = [];
      if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
        allMenus.value.forEach((item) => {
          defaultOpenedPaths.push(...getDefaultOpenedPaths(item.children));
        });
      }
      return defaultOpenedPaths;
    });
    function getDefaultOpenedPaths(menus: Menu.recordRaw[], rootPath = '') {
      const defaultOpenedPaths: string[] = [];
      menus.forEach((item) => {
        if (item.meta?.defaultOpened && item.children) {
          defaultOpenedPaths.push(resolveRoutePath(rootPath, item.path));
          const childrenDefaultOpenedPaths = getDefaultOpenedPaths(
            item.children,
            resolveRoutePath(rootPath, item.path)
          );
          if (childrenDefaultOpenedPaths.length > 0) {
            defaultOpenedPaths.push(...childrenDefaultOpenedPaths);
          }
        }
      });
      return defaultOpenedPaths;
    }

    // 判斷是否有權限
    function hasPermission(
      permissions: string[],
      menu: Menu.recordMainRaw | Menu.recordRaw
    ) {
      let isAuth = false;
      if (menu.meta?.auth) {
        isAuth = permissions.some((auth) => {
          if (typeof menu.meta?.auth === 'string') {
            return menu.meta.auth !== '' ? menu.meta.auth === auth : true;
          } else if (typeof menu.meta?.auth === 'object') {
            return menu.meta.auth.length > 0
              ? menu.meta.auth.includes(auth)
              : true;
          } else {
            return false;
          }
        });
      } else {
        isAuth = true;
      }
      return isAuth;
    }
    // 根據權限過濾導航
    function filterAsyncMenus<
      T extends Menu.recordMainRaw[] | Menu.recordRaw[]
    >(menus: T, permissions: string[]): T {
      const res: any = [];
      menus.forEach((menu) => {
        if (hasPermission(permissions, menu)) {
          const tmpMenu = cloneDeep(menu);
          if (tmpMenu.children && tmpMenu.children.length > 0) {
            tmpMenu.children = filterAsyncMenus(
              tmpMenu.children,
              permissions
            ) as Menu.recordRaw[];
            tmpMenu.children.length > 0 && res.push(tmpMenu);
          } else {
            delete tmpMenu.children;
            res.push(tmpMenu);
          }
        }
      });
      return res;
    }
    // 生成導航（前端生成）
    async function generateMenusAtFront() {
      filesystemMenusRaw.value = menu.filter(
        (item) => item.children.length !== 0
      );
    }
    // // 生成導航（後端生成）
    // async function generateMenusAtBack() {
    //   await apiApp.menuList().then(async (res) => {
    //     filesystemMenusRaw.value = (res.data as Menu.recordMainRaw[]).filter(item => item.children.length !== 0)
    //   }).catch(() => {})
    // }
    // 設置主導航
    function setActived(data: number | string) {
      if (typeof data === 'number') {
        // 如果是 number 類型，則認為是主導航的索引
        actived.value = data;
      } else {
        // 如果是 string 類型，則認為是路由，需要查找對應的主導航索引
        const findIndex = allMenus.value.findIndex((item) =>
          item.children.some(
            (r) => data.indexOf(`${r.path}/`) === 0 || data === r.path
          )
        );
        if (findIndex >= 0) {
          actived.value = findIndex;
        }
      }
    }

    return {
      actived,
      allMenus,
      sidebarMenus,
      sidebarMenusFirstDeepestPath,
      defaultOpenedPaths,
      generateMenusAtFront,
      // generateMenusAtBack,
      setActived,
    };
  }
);

export default useMenuStore;
