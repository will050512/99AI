<script setup lang="ts">
import { fetchChatAPIProcess } from '@/api';
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { t } from '@/locales';
import { router } from '@/router';
import { useAuthStore, useChatStore, useGlobalStoreWithOut } from '@/store';
import { DownSmall } from '@icon-park/vue-next';
import { useDialog, useMessage } from 'naive-ui';
import {
  computed,
  inject,
  nextTick,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { Message } from './components';
import AiBotComponent from './components/AiBot/index.vue';
import AppTips from './components/AppTips/index.vue';
import FooterComponent from './components/Footer/index.vue';
import HeaderComponent from './components/Header/index.vue';
import { useChat } from './hooks/useChat';
import { useCopyCode } from './hooks/useCopyCode';
import { useScroll } from './hooks/useScroll';

// 引入的依賴
const route = useRoute();
const dialog = useDialog();
const ms = useMessage();
const { isMobile } = useBasicLayout();
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();
useCopyCode();

// 引用的 store
const useGlobalStore = useGlobalStoreWithOut();
const authStore = useAuthStore();
const chatStore = useChatStore();

// ref 和計算屬性
const bottomContainer = ref();
const firstScroll = ref<boolean>(true);
const isAtBottom = ref(false);
const controller = ref(new AbortController());

const groupSources = computed(() => chatStore.groupList);
const tradeStatus = computed(() => route.query.trade_status as string);
const token = computed(() => route.query.token as string);
const isLogin = computed(() => authStore.isLogin);
const usingPlugin = computed(() => chatStore.currentPlugin);
const dataSources = computed(() => chatStore.chatList);
const activeGroupId = computed(() => chatStore.active);
const activeGroupInfo = computed(() => chatStore.getChatByGroupInfo());
const isPdfRoute = computed(() => route.path === '/pdf');

// 使用watch監聽activeGroupInfo的變化
const configObj = computed(() => {
  const configString = activeGroupInfo.value?.config;
  if (!configString) {
    return {}; // 提早返回一個空對象
  }

  try {
    return JSON.parse(configString);
  } catch (e) {
    return {}; // 解析失敗時返回一個空對象
  }
});

// 定義一個響應式的計算屬性來實時獲取 fileParsing
const fileParsing = computed(() => {
  // 獲取當前激活的對話組配置
  return String(configObj?.value?.fileInfo?.fileParsing || '');
  // 如果 modelInfo 存在，則返回 fileParsing 的值，否則返回 undefined
});

// 獲取模型
const activeModel = computed(() => {
  return String(configObj?.value?.modelInfo?.model || '');
});

// 獲取模型名稱
const activeModelName = computed(() => {
  return String(
    usingPlugin?.value?.pluginName ||
      configObj?.value.modelInfo.modelName ||
      'AI'
  );
});

// 獲取模型類型
const activeModelKeyType = computed(() => {
  return Number(configObj?.value.modelInfo.keyType || 1);
});

// 獲取模型頭像
const activeModelAvatar = computed(() => {
  return String(
    usingPlugin?.value?.pluginImg ||
      configObj?.value.modelInfo?.modelAvatar ||
      ''
  );
});

/* 當前對話組是否是應用 */
const activeAppId = computed(() => activeGroupInfo?.value?.appId || 0);

// 組合函數
const { addGroupChat, updateGroupChat, updateGroupChatSome } = useChat();

// 函數定義

const checkIfBottomVisible = () => {
  const element = scrollRef.value;
  if (!element) return;

  // 檢查是否允許滾動
  const canScroll = element.scrollHeight > element.clientHeight;

  if (!canScroll) {
    isAtBottom.value = true; // 如果不能滾動，直接設置為true
    return;
  }

  // 檢查是否已經滾動到底部
  const rect = bottomContainer.value.getBoundingClientRect();
  isAtBottom.value = rect.top < window.innerHeight;
};

// 滾動到底部
const handleScrollBtm = () => {
  bottomContainer.value.scrollIntoView({ behavior: 'smooth' });
};

const createNewChatGroup = inject('createNewChatGroup', () =>
  Promise.resolve()
) as () => Promise<void>;

// 會話
const onConversation = async ({
  msg,
  action,
  drawId,
  customId,
  model,
  modelName,
  modelType,
  modelAvatar,
  appId,
  extraParam,
  fileUrl,
  chatId,
}: // isEdit,
Chat.ConversationParams) => {
  if (groupSources.value.length === 0) {
    // await nextTick();
    await createNewChatGroup();
    // await chatStore.queryMyGroup();
  }

  console.log(action);

  if (chatId) {
    await chatStore.deleteChatsAfterId(chatId);
    componentKey.value += 1;
  }
  chatStore.setStreamIn(true);
  const useModelName = modelName || activeModelName.value;
  const useModelType = modelType || activeModelKeyType.value || 1;
  const useModelAvatar = modelAvatar || activeModelAvatar.value;
  const useAppId = appId || activeAppId.value;
  let message = msg || '提問';

  let useModel = model || activeModel.value;
  controller.value = new AbortController();

  if (usingPlugin.value?.deductType && usingPlugin.value?.deductType !== 0) {
    useModel = usingPlugin.value?.parameters;
  }

  /* 增加一條用戶記錄 */
  addGroupChat({
    text: message,
    model: useModel,
    modelName: modelName,
    modelType: modelType,
    inversion: true,
    fileInfo: fileUrl,
  });

  let options: any = {
    groupId: +activeGroupId.value,
    fileParsing: fileParsing.value,
  };

  /* 虛擬增加一條ai記錄 */
  addGroupChat({
    text: '',
    model: useModel,
    modelName: modelName,
    modelType: modelType,
    loading: true,
    inversion: false,
    error: false,
    modelAvatar: useModelAvatar,
    status: 2,
    pluginParam: usingPlugin.value?.parameters,
  });

  await scrollToBottom();
  const timer: any = null;
  let data: any = null;
  chatStore.setStreamIn(true);
  // isStreamIn.value = true;
  useGlobalStore.updateIsChatIn(true);

  const fetchChatAPIOnce = async () => {
    if (
      useModel === 'dall-e-3' ||
      useModel === 'midjourney' ||
      useModel === 'suno-music' ||
      useModel === 'stable-diffusion' ||
      useModel === 'luma-video' ||
      useModel === 'cog-video' ||
      useModel.includes('flux') ||
      useModel === 'ai-ppt'
    ) {
      await handleSingleResponseModel();
    } else {
      await handleStreamResponseModel();
    }
  };

  const handleSingleResponseModel = async () => {
    try {
      const response = await fetchChatAPIProcess({
        prompt: message,
        fileInfo: fileUrl || '',
        model: useModel,
        modelName: useModelName,
        modelAvatar: useModelAvatar,
        modelType: 2,
        action: action,
        drawId: drawId || '',
        customId: customId,
        options,
        usingPluginId: usingPlugin.value?.pluginId || 0,
        extraParam: extraParam || {},
        signal: controller.value.signal,
      });

      processSingleResponse(response);
    } catch (e) {
      // console.log(e);
    }
  };

  const handleStreamResponseModel = async () => {
    let fullText = ''; // 用於累加整個會話的內容
    let lastProcessedIndex = 0;

    try {
      await fetchChatAPIProcess({
        model: useModel,
        modelName: useModelName,
        modelType: useModelType,
        prompt: msg,
        usingPluginId: usingPlugin.value?.pluginId || 0,
        fileInfo: fileUrl,
        appId: useAppId || 0,
        modelAvatar: useModelAvatar,
        options,
        signal: controller.value.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target;
          const responseText = xhr.responseText;
          const newResponsePart = responseText.substring(lastProcessedIndex);
          lastProcessedIndex = responseText.length; // 更新處理位置

          const responseParts = newResponsePart.trim().split('\n');

          responseParts.forEach((part: string) => {
            try {
              // 嘗試將字串解析為 JSON 對象
              const jsonObj = JSON.parse(part);
              if (jsonObj.userBalance)
                authStore.updateUserBalance(jsonObj.userBalance);
              // 檢查 jsonObj 是否具有有效的 text 字段
              if (jsonObj.text) {
                // 累加 text 字段的內容到 fullText
                fullText += jsonObj.text;
              }
            } catch (error) {}
          });
          // 直接使用響應文本更新當前文本
          // 假設responseText是最新獲取到的文本塊
          // fullText += responseText;

          // 更新UI
          updateGroupChat(dataSources.value.length - 1, {
            chatId: data?.chatId,
            text: fullText, // 使用累加後的全文本更新
            modelType: 1,
            modelName: useModelName,
            error: false,
            loading: true,
            fileInfo: data?.fileInfo,
          });
          // scrollToBottom();
          scrollToBottomIfAtBottom();
        },
      });

      // 流式處理完成後的邏輯
      // processingCompleted();
    } catch (error) {
      handleStreamError(error);
    } finally {
      useGlobalStore.updateIsChatIn(false);
      // typingStatusEnd.value = true;
      await chatStore.queryMyGroup();
      updateGroupChatSome(dataSources.value.length - 1, { loading: false });
    }
  };

  const processSingleResponse = (response: any) => {
    if (!response) return;

    const {
      modelName,
      model,
      drawId,
      customId,
      text,
      status,
      fileInfo,
      userBalance,
      pluginParam,
    } = response;

    const index = dataSources.value.length - 1;
    const data = {
      text,
      model,
      modelType: 2,
      modelName,
      inversion: false,
      drawId,
      customId,
      error: false,
      loading: false,
      fileInfo,
      status,
      pluginParam,
    };

    updateGroupChat(index, data);
    scrollToBottom();

    if (Object.keys(userBalance).length) {
      authStore.updateUserBalance(userBalance);
    }
  };

  const handleStreamError = (error: any) => {
    console.error('fetchChatAPIProcess error:', error);
    useGlobalStore.updateIsChatIn(false);
    clearInterval(timer);
    chatStore.setStreamIn(false);
    // isStreamIn.value = false;

    if (
      error.code === 402 ||
      error?.message.includes('餘額不足') ||
      error?.message.includes('體驗額度使用完畢')
    ) {
      if (!isLogin.value) {
        authStore.setLoginDialog(true);
      } else {
        useGlobalStore.updateGoodsDialog(true);
      }
    }

    if (error.message.includes('手機號綁定')) {
      if (!isLogin.value) {
        authStore.setLoginDialog(true);
      } else {
        useGlobalStore.updatePhoneDialog(true);
      }
    }

    if (error.message.includes('實名認證')) {
      if (!isLogin.value) {
        authStore.setLoginDialog(true);
      } else {
        useGlobalStore.updateIdentityDialog(true);
      }
    }

    if (error.message.includes('違規')) {
      useGlobalStore.UpdateBadWordsDialog(true);
    }

    if (error?.message.includes('canceled')) {
      updateGroupChatSome(dataSources.value.length - 1, { loading: false });
      scrollToBottomIfAtBottom();
      setTimeout(() => {
        authStore.getUserBalance();
      }, 200);
      return;
    }

    const currentChat = dataSources.value[dataSources.value.length - 1];
    updateGroupChat(dataSources.value.length - 1, {
      chatId: data?.chatId,
      ttsUrl: data?.ttsUrl,
      taskData: data?.taskData,
      videoUrl: data?.videoUrl,
      audioUrl: data?.audioUrl,
      status: data?.status,
      action: data?.action,
      text: currentChat.text === '' ? '' : currentChat.text,
      inversion: false,
      loading: false,
      fileInfo: data?.fileInfo,
      conversationOptions: null,
      pluginParam: data?.pluginParam,
    });
    scrollToBottomIfAtBottom();
  };

  await fetchChatAPIOnce();
  //chatStore.queryMyGroup();
  chatStore.setStreamIn(false);

  // 延遲3秒
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await chatStore.queryActiveChatLogList();
  await new Promise((resolve) => setTimeout(resolve, 200));
  await scrollToBottom();
};

// 停止回覆
const pauseRequest = () => {
  controller.value.abort();
  chatStore.setStreamIn(false);
  setTimeout(scrollToBottom, 1000);
};

// 其他登錄方式
const otherLoginByToken = async (token: string) => {
  try {
    // 設置用戶 token
    authStore.setToken(token);

    // 跳轉到 Chat 頁面
    await router.replace({ name: 'Chat', query: {} });

    // 顯示成功消息
    ms.success('賬戶登錄成功、開始體驗吧！');

    // 獲取用戶資訊
    await authStore.getUserInfo();
  } catch (error) {
    // 錯誤處理
    console.error('登錄過程中發生錯誤:', error);
  }
};

// 支付回調處理
const handleRefresh = async () => {
  // 檢查交易狀態是否成功
  if (tradeStatus.value.toLowerCase().includes('success')) {
    // 顯示成功消息
    ms.success('感謝你的購買、祝您使用愉快~', { duration: 5000 });

    // 獲取用戶資訊
    await authStore.getUserInfo();

    // 跳轉到 Chat 頁面
    router.replace({ name: 'Chat', query: {} });
  } else {
    // 顯示錯誤消息
    ms.error('您還沒有購買成功哦~');
  }
};

const componentKey = ref(0);

// 刪除
const handleDelete = async ({ chatId }: Chat.Chat) => {
  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      await chatStore.deleteChatById(chatId);
      // await chatStore.queryActiveChatLogList();

      componentKey.value += 1;
      // await chatStore.queryActiveChatLogList();
      // await nextTick(async () => {
      //   await chatStore.queryActiveChatLogList();
      // });
      ms.success(t('chat.deleteSuccess'));
    },
  });
};

// // 刪除
// const handleDeleteAfterId = async (chatId: number) => {
//   console.log('chatId', chatId);
//   await chatStore.deleteChatsAfterId(chatId);
//   componentKey.value += 1;
// };

// const handleTextSelected = (processedText: string) => {
//   console.log('processedText:', processedText);
//   prompt.value = processedText;
//   nextTick(() => {
//     // 調用autoResize函數，傳入textarea元素以重置其高度
//     if (inputRef.value) {
//       autoResize(inputRef.value);
//     }
//   });
//   // autoResize({ target: inputRef.value });

//   // 或者，你也可以直接傳入文本框元素
//   // autoResize({ target: $refs.inputRef });
// };

const handleRegenerate = async (index: number, chatId: number) => {
  console.log('index', index);
  if (chatStore.groupList.length === 0 || index === 0) return;
  let message = '';
  /* 如果有index就是重新生成 */
  if (index && typeof index === 'number') {
    const { text, inversion } = dataSources.value[index - 1];
    if (text) {
      message = text;
    }
    if (!inversion) {
      return;
    }
  }
  onConversation({ msg: message, chatId: chatId - 1 });
  scrollToBottom();
};

watch(
  dataSources,
  (val) => {
    if (val.length === 0) return;
    if (firstScroll.value) {
      firstScroll.value = false;
      scrollToBottom();
    }
  },
  { immediate: true }
);

watch(
  scrollRef,
  () => {
    checkIfBottomVisible();
  },
  { flush: 'post' }
);

onMounted(async () => {
  if (token.value) otherLoginByToken(token.value);
  if (tradeStatus.value) handleRefresh();
  // if (!isLogin.value) authStore.setLoginDialog(true);
  await nextTick(async () => {
    await chatStore.queryActiveChatLogList();
  });

  // 添加滾動事件監聽器
});

onMounted(() => {
  const scrollElement = scrollRef.value;
  if (scrollElement) {
    scrollElement.addEventListener('scroll', checkIfBottomVisible);
  } else {
  }
});

// 提供onConversation給後代組件
provide('onConversation', onConversation);
provide('handleRegenerate', handleRegenerate);
</script>

<template>
  <div class="h-full flex flex-col pb-2 bg-white dark:bg-gray-800">
    <HeaderComponent v-if="!isPdfRoute" />
    <main class="flex-1 overflow-hidden">
      <div
        id="scrollRef"
        ref="scrollRef"
        class="relative h-full overflow-hidden overflow-y-auto scroll-smooth"
      >
        <div
          id="image-wrapper"
          class="w-full m-auto h-full mx-auto"
          :class="[isMobile ? 'p-3' : 'p-3 w-full']"
          :style="{ maxWidth: '64rem' }"
        >
          <template v-if="!dataSources.length && !activeAppId">
            <div
              class="flex justify-center items-center text-center"
              :class="[isMobile ? 'h-full' : 'h-4/5 ']"
            >
              <AiBotComponent />
            </div>
          </template>
          <template v-if="!dataSources.length && activeAppId">
            <div
              class="flex justify-center items-center"
              :class="[isMobile ? 'h-full' : 'h-4/5 ']"
            >
              <AppTips :appId="activeAppId" />
            </div>
          </template>
          <template v-if="dataSources.length">
            <div :key="componentKey">
              <Message
                v-for="(item, index) of dataSources"
                :index="index"
                :chatId="item.chatId"
                :text="item.text"
                :model="item.model"
                :modelType="item.modelType"
                :modelName="item.modelName"
                :modelAvatar="item.modelAvatar"
                :status="item.status"
                :fileInfo="item.fileInfo"
                :ttsUrl="item.ttsUrl"
                :taskData="item.taskData"
                :videoUrl="item.videoUrl"
                :audioUrl="item.audioUrl"
                :action="item.action"
                :inversion="item.inversion"
                :loading="item.loading"
                :drawId="item.drawId"
                :customId="item.customId"
                :pluginParam="item.pluginParam"
                :promptReference="item.promptReference"
                :isLast="index === dataSources.length - 1"
                @delete="handleDelete(item)"
              />
              <!-- 動態調整佔位高度 -->
              <!-- <div style="height: 15vh"></div> -->
              <div class="sticky bottom-0 left-0 flex justify-center mb-1 p-1">
                <DownSmall
                  size="24"
                  v-if="!isAtBottom"
                  class="bg-white p-1 shadow-sm rounded-full border text-gray-700 border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                  @click="handleScrollBtm"
                  theme="outline"
                  :strokeWidth="2"
                />
              </div>
            </div>
          </template>
          <div ref="bottomContainer" class="bottom" />
        </div>
      </div>
    </main>
    <FooterComponent @pause-request="pauseRequest" />
  </div>
</template>

<style>
@keyframes rotateAnimation {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

::v-deep .rotate-icon {
  animation: rotateAnimation 1s linear infinite;
}
</style>
