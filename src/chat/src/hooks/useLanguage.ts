import { useAppStore } from '@/store';
import { enUS, zhCN, zhTW } from 'naive-ui';
import { computed } from 'vue';

export function useLanguage() {
  const appStore = useAppStore();

  // 計算 Naive UI 的語言配置
  const naiveUILocale = computed(() => {
    switch (appStore.language) {
      case 'en-US': return enUS;
      case 'zh-CN': return zhCN;
      case 'zh-TW': return zhTW;
      default: return zhCN;
    }
  });

  // 監聽 appStore.language 的變化，並據此更新 Vue I18n 的語言環境
  // watch(() => appStore.language, (newLocale) => {
  //   setLocale(newLocale);
  // }, { immediate: true });

  return { naiveUILocale };
}
