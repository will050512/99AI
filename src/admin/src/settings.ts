import type { RecursiveRequired, Settings } from '#/global';
import settingsDefault from '@/settings.default';
import { defaultsDeep } from 'lodash-es';

const globalSettings: Settings.all = {
  // 請在此處編寫或粘貼配置代碼
  menu: {
    menuMode: 'single',
    enableSubMenuCollapseButton: true,
    enableHotkeys: false,
  },
  app: {
    enableDynamicTitle: true,
  },
  topbar: {
    /**
     * static 默認，靜止，跟隨頁面滾動
     * fixed 固定，不跟隨頁面滾動，始終固定在頂部
     * sticky 粘性，頁面往下滾動時隱藏，往上滾動時顯示
     */
    mode: 'static',
  },
  toolbar: {
    fullscreen: false,
    pageReload: true,
  },
  navSearch: {
    enableHotkeys: false,
  },
  copyright: {
    enable: false,
  },
};

export default defaultsDeep(
  globalSettings,
  settingsDefault
) as RecursiveRequired<Settings.all>;
