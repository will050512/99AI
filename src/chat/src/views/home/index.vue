<template>
  <div class="iframe-container">
    <iframe ref="iframe" class="iframe" frameborder="0"></iframe>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.iframe-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.iframe {
  flex: 1;
  border: none;
}
</style>

<script setup lang="ts">
import type { ResData } from '@/api/types';
import { fetchLoginByCodeAPI, fetchWxLoginRedirectAPI } from '@/api/user';
import { useAuthStore } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isLogin = computed(() => authStore.isLogin);
const wechatSilentLoginStatus = computed(
  () => Number(authStore.globalConfig?.wechatSilentLoginStatus) === 1
);

const iframe = ref<HTMLIFrameElement | null>(null);

async function checkForCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const codes = urlParams.getAll('code');
  const code = codes.length > 0 ? codes[codes.length - 1] : null;

  if (!code) {
    const currentUrl = window.location.href.split('#')[0];
    const res: ResData = await fetchWxLoginRedirectAPI({ url: currentUrl });
    if (res.success) {
      window.location.href = res.data;
    }
  }
}

async function loginByWechat() {
  const urlParams = new URLSearchParams(window.location.search);
  const codes = urlParams.getAll('code');
  const code = codes.length > 0 ? codes[codes.length - 1] : null;

  if (code) {
    const res: ResData = await fetchLoginByCodeAPI({ code });
    if (res.success) {
      authStore.setToken(res.data);
      await authStore.getUserInfo();
      authStore.setLoginDialog(false); // 關閉登錄對話框
      // 直接導航到 /chat 頁面
      router.replace('/chat');
    }
  }
}

async function init() {
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) {
    await checkForCode();
  }
}

onMounted(async () => {
  if (isLogin.value) {
    router.replace('/chat');
    return;
  }

  let htmlContent = computed(() => authStore.globalConfig?.homeHtml || '');

  // 添加 goToChat 函數到 htmlContent 中
  htmlContent = computed(
    () => `
    ${authStore.globalConfig?.homeHtml || ''}
  `
  );

  if (iframe.value) {
    const doc =
      iframe.value.contentDocument || iframe.value.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent.value); // 訪問 computed 屬性的值
      doc.close();
    }
  }

  // 頁面加載完成後預加載 /chat 路由組件
  import('@/views/chat/chat.vue');

  window.addEventListener('message', async (event) => {
    if (event.data === 'goToChat') {
      await loginByWechat();
      router.replace('/chat');
    }
    if (event.data === 'goToLogin') {
      authStore.setLoginDialog(true);
    }
  });

  await init();
});

// 監控 isLogin 狀態的變化
watch(isLogin, (newVal) => {
  if (newVal) {
    router.replace('/chat');
  }
});
</script>
