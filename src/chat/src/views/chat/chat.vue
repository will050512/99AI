<script setup lang="ts">
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { useAppStore, useAuthStore, useChatStore } from '@/store';
import { NLayout, NWatermark, useMessage } from 'naive-ui';
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChatBase from './chatBase.vue';
import Sider from './components/sider/index.vue';

const ms = useMessage();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const chatStore = useChatStore();
const authStore = useAuthStore();
const { isMobile } = useBasicLayout();
const isLogin = computed(() => authStore.isLogin);
const collapsed = computed(() => appStore.siderCollapsed);
const appId = computed(() => route.query.appId as string);
const startX = ref(0);
const endX = ref(0);

const showWatermark = computed(
  () => Number(authStore.globalConfig?.showWatermark) === 1
);
const userId = ref(authStore.userInfo.id ?? '');
const isModelInherited = computed(
  () => Number(authStore.globalConfig?.isModelInherited) === 1
);
const isStreamIn = computed(() => {
  return chatStore.isStreamIn !== undefined ? chatStore.isStreamIn : false;
});

watch(isLogin, async (newVal, oldVal) => {
  if (newVal && !oldVal) {
    await chatStore.queryMyGroup();
    // router.replace('/chat');
    window.location.href = '/chat';
  }
});

const getMobileClass = computed(() => {
  if (isMobile.value) return ['rounded-none', 'shadow-none'];
  return ['rounded-none', 'shadow-md', 'dark:border-gray-900'];
});

const getContainerClass = computed(() => {
  return ['h-full', { 'pl-[260px]': !isMobile.value && !collapsed.value }];
});

/* 新增一個對話 */
async function createNewChatGroup(appId?: number) {
  if (isStreamIn.value) {
    ms.info('AI回覆中，請稍後再試');
    return;
  }

  chatStore.setStreamIn(false);
  try {
    // addLoading.value = true;
    // 檢查 activeConfig 是否存在
    if (appId && appId > 0) {
      await chatStore.addNewChatGroup(appId);
    } else {
      const { modelInfo } = chatStore.activeConfig;
      if (
        modelInfo &&
        isModelInherited.value &&
        chatStore.activeGroupAppId === 0
      ) {
        const config = {
          modelInfo,
        };
        await chatStore.addNewChatGroup(0, config);
      } else {
        await chatStore.addNewChatGroup();
      }
    }

    // chatStore.queryMyGroup();
    // addLoading.value = false;
    chatStore.setUsingPlugin(null);

    if (isMobile.value) {
      appStore.setSiderCollapsed(true);
    }
  } catch (error) {
    // addLoading.value = false;
  }
}

function handleTouchStart(event: any) {
  startX.value = event.touches[0].clientX;
}

function handleTouchEnd(event: any) {
  endX.value = event.changedTouches[0].clientX;
  if (endX.value - startX.value > 100) {
    // 判斷向右滑動的最小距離（可以根據需要調整）
    if (isMobile.value) {
      appStore.setSiderCollapsed(false);
    }
  }
}

onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchend', handleTouchEnd);
});

onUnmounted(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
});

// onMounted(async () => {
//   if (dataSources.value.length === 0) {
//     await nextTick();
//     createNewChatGroup();
//   }
// });

provide('createNewChatGroup', createNewChatGroup);

watch(
  appId,
  async (newVal, oldVal) => {
    if (newVal) {
      const id = +newVal; // 轉換appId為數字類型
      router.replace('/chat');
      // await router.replace({ path: '/chat', query: {} }); // 清除當前查詢參數
      await nextTick(); // 等待導航完成
      createNewChatGroup(id); // 調用創建新對話組的方法
    }
  },
  { immediate: true } // 立即執行，處理組件加載時的邏輯
);
</script>

<template>
  <NWatermark
    v-if="showWatermark && isLogin"
    :content="'#' + userId"
    cross
    fullscreen
    :font-size="16"
    :line-height="16"
    :width="384"
    :height="384"
    :x-offset="12"
    :y-offset="60"
    :rotate="-15"
  />
  <div class="h-full transition-all">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
        <Sider class="h-full" />
        <ChatBase class="w-full flex-1" />
      </NLayout>
    </div>
  </div>
</template>
