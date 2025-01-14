import type { RouteRecordName, RouteRecordRaw } from 'vue-router'

type RecursiveRequired<T> = {
  [P in keyof T]-?: RecursiveRequired<T[P]>
}
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

declare namespace Settings {
  interface app {
    /**
     * 顏色方案
     * @默認值 `''` 跟隨系統
     * @可選值 `'light'` 明亮模式
     * @可選值 `'dark'` 暗黑模式
     */
    colorScheme?: '' | 'light' | 'dark'
    /**
     * 是否開啟權限功能
     * @默認值 `false`
     */
    enablePermission?: boolean
    /**
     * 是否開啟載入進度條
     * @默認值 `true`
     */
    enableProgress?: boolean
    /**
     * 是否開啟動態標題
     * @默認值 `false`
     */
    enableDynamicTitle?: boolean
    /**
     * 路由數據來源
     * @默認值 `'frontend'` 前端
     * @可選值 `'backend'` 後端
     * @可選值 `'filesystem'` 文件系統
     */
    routeBaseOn?: 'frontend' | 'backend' | 'filesystem'
  }
  interface home {
    /**
     * 是否開啟主頁
     * @默認值 `true`
     */
    enable?: boolean
    /**
     * 主頁名稱
     * @默認值 `'主頁'`
     */
    title?: string
    /**
     * 主頁完整路徑
     * @默認值 `'/'`
     */
    fullPath?: string
  }
  interface layout {
    /**
     * 是否開啟移動端適配，開啟後當頁面寬度小於 992px 時自動切換為移動端展示
     * @默認值 `false`
     */
    enableMobileAdaptation?: boolean
  }
  interface menu {
    /**
     * 導航欄數據來源，當 `app.routeBaseOn: 'filesystem'` 時生效
     * @默認值 `'frontend'` 前端
     * @可選值 `'backend'` 後端
     */
    baseOn?: 'frontend' | 'backend'
    /**
     * 導航欄模式
     * @默認值 `'side'` 側邊欄模式（有主導航）
     * @可選值 `'head'` 頂部模式
     * @可選值 `'single'` 側邊欄模式（無主導航）
     */
    menuMode?: 'side' | 'head' | 'single'
    /**
     * 切換主導航是否跳轉頁面
     * @默認值 `false`
     */
    switchMainMenuAndPageJump?: boolean
    /**
     * 次導航是否只保持一個子項的展開
     * @默認值 `true`
     */
    subMenuUniqueOpened?: boolean
    /**
     * 次導航是否收起
     * @默認值 `false`
     */
    subMenuCollapse?: boolean
    /**
     * 是否開啟次導航的展開/收起按鈕
     * @默認值 `false`
     */
    enableSubMenuCollapseButton?: boolean
    /**
     * 是否開啟主導航切換快捷鍵
     * @默認值 `false`
     */
    enableHotkeys?: boolean
  }
  interface topbar {
    /**
     * 模式
     * @默認值 `'static'` 靜止，跟隨頁面滾動
     * @可選值 `'fixed'` 固定，不跟隨頁面滾動，始終固定在頂部
     * @可選值 `'sticky'` 粘性，頁面往下滾動時隱藏，往上滾動時顯示
     */
    mode?: 'static' | 'fixed' | 'sticky'
  }
  interface tabbar {
    /**
     * 是否開啟標籤欄
     * @默認值 `false`
     */
    enable?: boolean
    /**
     * 是否開啟標籤欄圖標顯示
     * @默認值 `false`
     */
    enableIcon?: boolean
    /**
     * 是否開啟標籤欄快捷鍵
     * @默認值 `false`
     */
    enableHotkeys?: boolean
  }
  interface toolbar {
    /**
     * 是否開啟麵包屑導航
     * @默認值 `true`
     */
    breadcrumb?: boolean
    /**
     * 是否開啟導航搜索
     * @默認值 `true`
     */
    navSearch?: boolean
    /**
     * 是否開啟全屏
     * @默認值 `false`
     */
    fullscreen?: boolean
    /**
     * 是否開啟頁面刷新
     * @默認值 `false`
     */
    pageReload?: boolean
    /**
     * 是否開啟顏色主題
     * @默認值 `false`
     */
    colorScheme?: boolean
  }
  interface mainPage {
    /**
     * 是否開啟頁面快捷鍵
     * @默認值 `true`
     */
    enableHotkeys?: boolean
  }
  interface navSearch {
    /**
     * 是否開啟導航搜索快捷鍵
     * @默認值 `true`
     */
    enableHotkeys?: boolean
  }
  interface copyright {
    /**
     * 是否開啟底部版權，同時在路由 meta 對象裡可以單獨設置某個路由是否顯示底部版權資訊
     * @默認值 `false`
     */
    enable?: boolean
    /**
     * 網站運行日期
     * @默認值 `''`
     */
    dates?: string
    /**
     * 公司名稱
     * @默認值 `''`
     */
    company?: string
    /**
     * 網站地址
     * @默認值 `''`
     */
    website?: string
    /**
     * 網站備案號
     * @默認值 `''`
     */
    beian?: string
  }
  interface all {
    /** 應用設置 */
    app?: app
    /** 主頁設置 */
    home?: home
    /** 佈局設置 */
    layout?: layout
    /** 導航欄設置 */
    menu?: menu
    /** 頂欄設置 */
    topbar?: topbar
    /** 標籤欄設置 */
    tabbar?: tabbar
    /** 工具欄設置 */
    toolbar?: toolbar
    /** 頁面設置 */
    mainPage?: mainPage
    /** 導航搜索設置 */
    navSearch?: navSearch
    /** 底部版權設置 */
    copyright?: copyright
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | (() => string)
    icon?: string
    defaultOpened?: boolean
    auth?: string | string[]
    sidebar?: boolean
    menu?: boolean
    breadcrumb?: boolean
    activeMenu?: string
    cache?: boolean | string | string[]
    noCache?: string | string[]
    link?: string
    breadcrumbNeste?: Route.breadcrumb[]
  }
}

declare namespace Route {
  interface recordMainRaw {
    meta?: {
      title?: string | (() => string)
      icon?: string
      auth?: string | string[]
    }
    children: RouteRecordRaw[]
  }
  interface breadcrumb {
    path: string
    title?: string | (() => string)
    icon?: string
    hide: boolean
  }
}

declare namespace Menu {
  /** 原始 */
  interface recordRaw {
    path?: string
    meta?: {
      title?: string | (() => string)
      icon?: string
      defaultOpened?: boolean
      auth?: string | string[]
      menu?: boolean
      link?: string
    }
    children?: recordRaw[]
  }
  /** 主導航 */
  interface recordMainRaw {
    meta?: {
      title?: string | (() => string)
      icon?: string
      auth?: string | string[]
    }
    children: recordRaw[]
  }
}

declare namespace Tabbar {
  interface recordRaw {
    tabId: string
    fullPath: string
    routeName?: RouteRecordName | null
    title?: string | (() => string)
    icon?: string
    name: string[]
  }
}
