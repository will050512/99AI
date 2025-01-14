import { useAppStoreWithOut } from '@/store/modules/app';
import type { Language } from '@/store/modules/app/helper';
import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';
// import zhTW from './zh-TW.json';

const appStore = useAppStoreWithOut();

const savedLocale = localStorage.getItem('appLanguage');

// const defaultLocale = savedLocale || appStore.language || 'zh-CN';
// const defaultLocale = 'en-US'
const defaultLocale = 'zh-CN';

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  allowComposition: true,
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    // 'zh-TW': zhTW,
  },
});

export const t = i18n.global.t;

export function setLocale(locale: Language) {
  i18n.global.locale = locale;
  // 將新的語言設置保存到 localStorage
  localStorage.setItem('appLanguage', locale);
}

// 使用加密和指定過期時間（或永久保存）保存語言設置
// export function setLocale(locale: Language) {
//   console.log(`正在切換語言至: ${locale}`);
//   i18n.global.locale = locale;
//   // 使用自定義 localStorage 工具保存語言設置
//   ls.set('appLanguage', locale);
//   console.log(`當前語言已切換至: ${i18n.global.locale}`);
// }

export function setupI18n(app: App) {
  app.use(i18n);
}

export default i18n;
