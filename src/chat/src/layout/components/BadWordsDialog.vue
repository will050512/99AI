<script setup lang="ts">
import { useAuthStore, useGlobalStoreWithOut } from '@/store';
import 'md-editor-v3/lib/preview.css';
import { computed, ref, watch } from 'vue';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const useGlobalStore = useGlobalStoreWithOut();

const globalConfig = computed(() => authStore.globalConfig); // 獲取全局配置

const countdown = ref(15); // 倒計時 15 秒
const isCountdownFinished = ref(false); // 倒計時結束標誌

function startCountdown() {
  const interval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      isCountdownFinished.value = true; // 倒計時結束
      clearInterval(interval); // 清除定時器
    }
  }, 1000);
}

function handleAgree() {
  if (isCountdownFinished.value) {
    useGlobalStore.UpdateBadWordsDialog(false); // 關閉用戶協議彈窗
    countdown.value = 15;
    isCountdownFinished.value = false;
  }
}

// onMounted(() => {
//   startCountdown(); // 組件掛載時啟動倒計時
// });

// 監聽 props.visible 的變化，當其變為 true 時重新啟動倒計時
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      startCountdown();
    }
  },
  { immediate: true } // 添加 immediate 選項，初始化時立即執行
);

// 初始啟動一次倒計時
if (props.visible) {
  startCountdown();
}

// onUnmounted(() => {
//   // countdown.value = 15;
//   isCountdownFinished.value = false; // 重置狀態
// });
</script>

<template>
  <div
    v-if="props.visible"
    class="fixed inset-0 z-50 px-2 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
      class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col relative"
    >
      <!-- 顯示用戶協議標題 -->
      <div class="flex justify-between items-center mb-3">
        <span class="text-xl">合理合規須知</span>
      </div>

      <!-- 直接顯示用戶協議的 HTML 內容 -->
      <div class="flex-1 overflow-y-auto">
        <!-- <div
          v-html="globalConfig.agreementInfo"
          class="dark:bg-gray-900 p-4"
        ></div> -->
        <p>請合理合規使用，請勿諮詢敏感資訊或使用敏感詞生成圖片。</p>
        <p>
          多次觸發平臺風控，將記錄【賬號/IP】等資訊並禁止使用，保留向有關部門遞交相關記錄的權利。
        </p>
      </div>

      <!-- 倒計時和同意按鈕 -->
      <div class="flex justify-end mt-3">
        <button
          :disabled="!isCountdownFinished"
          @click="handleAgree"
          class="px-4 py-2 shadow-sm bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:bg-gray-400"
        >
          <span v-if="isCountdownFinished">已知曉</span>
          <span v-else>請等待 {{ countdown }} 秒</span>
        </button>
      </div>
    </div>
  </div>
</template>
