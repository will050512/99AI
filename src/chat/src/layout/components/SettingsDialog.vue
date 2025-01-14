<template>
  <transition name="modal-fade">
    <div
      v-if="props.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col"
        :class="
          isMobile
            ? ' w-full h-full'
            : 'max-h-[80vh] rounded-lg shadow-lg w-full max-w-5xl p-4 mx-2 min-h-[70vh] '
        "
      >
        <!-- 標題部分 -->
        <div class="flex justify-between items-center mb-2">
          <span class="text-xl font-bold">設置</span>
          <button
            @click="handleClose"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <span class="sr-only">Close</span>
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <!-- 主體部分 -->
        <div class="flex flex-grow">
          <!-- 左邊標籤欄 -->
          <div class="w-1/5 bg-white dark:bg-gray-800 rounded-lg">
            <div
              v-for="(tab, index) in tabs"
              :key="index"
              @click="activeTab = index"
              class="relative flex items-center gap-3 px-3 py-3 my-1 break-all rounded-md cursor-pointer group dark:hover:bg-gray-800 font-medium text-sm"
              :class="{
                'bg-gray-50 text-primary-600 dark:bg-gray-800 dark:text-white':
                  activeTab === index,
                'text-gray-700 dark:bg-gray-900 dark:text-gray-400':
                  activeTab !== index,
              }"
            >
              {{ tab.name }}
            </div>
          </div>
          <!-- 右邊內容區域 -->
          <div class="w-3/4 bg-white dark:bg-gray-900 p-1 rounded-lg ml-4">
            <transition name="fade" mode="out-in">
              <component
                :is="tabs[activeTab].component"
                :key="tabs[activeTab].name"
                :visible="props.visible"
              ></component>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { useGlobalStoreWithOut } from '@/store';
import { markRaw, ref } from 'vue';
import NoticeDialog from './Settings/NoticeDialog.vue';
import SignInDialog from './Settings/SignInDialog.vue';

const useGlobalStore = useGlobalStoreWithOut();
interface Props {
  visible: boolean;
}
const { isMobile } = useBasicLayout();
const props = defineProps<Props>();

// 使用 markRaw 避免組件變成 reactive 對象
const tabs = ref([
  { name: '網站公告', component: markRaw(NoticeDialog) },
  { name: '網站公告', component: markRaw(NoticeDialog) },
  { name: '簽到獎勵', component: markRaw(SignInDialog) },
  { name: '通用設置', component: markRaw(SignInDialog) },
  { name: '基礎資訊', component: markRaw(SignInDialog) },
  { name: '消費記錄', component: markRaw(SignInDialog) },
  { name: '退出登錄', component: markRaw(SignInDialog) },
  // 繼續添加其他標籤和對應的組件
]);

const activeTab = ref(0);

function handleClose() {
  useGlobalStore.updateGoodsDialog(false);
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
