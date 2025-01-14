import { createApp } from 'vue';
import App from './App.vue';
import { setupI18n } from './locales';
import { setupAssets, setupScrollbarStyle } from './plugins';
import { setupRouter } from './router';
import { setupStore } from './store';
import './styles/global.less';

// 禁用生產環境中的 console.log
if (process.env.NODE_ENV === 'production') {
  console.log = function () {};
}

async function bootstrap() {
  const app = createApp(App);

  // 定義自定義指令
  app.directive('focus', {
    // 當被綁定的元素掛載到 DOM 上時
    mounted(el) {
      // 聚焦元素
      el.focus();
    },
  });

  // 設置樣式和資源
  setupAssets();
  setupScrollbarStyle();
  setupStore(app);
  setupI18n(app);
  await setupRouter(app);

  // 延遲加載外掛
  const { default: VueViewer } = await import('v-viewer');
  app.use(VueViewer);
  const { MotionPlugin } = await import('@vueuse/motion');
  app.use(MotionPlugin);

  app.mount('#app');
}

bootstrap();
