import '@/utils/system.copyright';

import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

import 'vue-m-message/dist/style.css';

import 'overlayscrollbars/overlayscrollbars.css';

import App from './App.vue';
import router from './router';
import ui from './ui-provider';

// 自定義指令
import directive from '@/utils/directive';

// 加載 svg 圖標
import 'virtual:svg-icons-register';

// 加載 iconify 圖標
import { downloadAndInstall } from '@/iconify';
import icons from '@/iconify/index.json';

import 'virtual:uno.css';

// 全局樣式
import '@/assets/styles/globals.scss';
import pinia from './store';

const app = createApp(App);
app.use(FloatingVue, {
  distance: 12,
});
// app.use(Message);
app.use(pinia);
app.use(router);
app.use(ui);
directive(app);
if (icons.isOfflineUse) {
  for (const info of icons.collections) {
    downloadAndInstall(info);
  }
}

app.mount('#app');
