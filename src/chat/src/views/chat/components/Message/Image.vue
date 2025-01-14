<script lang="ts" setup>
import { useChatStore } from '@/store';
import { Copy, Delete } from '@icon-park/vue-next';
import mdKatex from '@traptitech/markdown-it-katex';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import mila from 'markdown-it-link-attributes';
import { NImage, useMessage } from 'naive-ui';
import { computed, inject, onUnmounted, ref, watch } from 'vue';

import { useBasicLayout } from '@/hooks/useBasicLayout';
import { t } from '@/locales';
interface Props {
  inversion?: boolean;
  text?: string;
  modelType?: number;
  status?: number;
  loading?: boolean;
  asRawText?: boolean;
  fileInfo?: string;
  model?: string;
  drawId?: string;
  customId?: string;
  modelName?: string;
}

interface Emit {
  (ev: 'delete'): void;
  (ev: 'copy'): void;
}

const onConversation = inject<any>('onConversation');

const fileInfoArray = computed(() => {
  return props.fileInfo ? props.fileInfo.split(',') : [];
});

const buttons = computed(() => {
  try {
    const extendObj = JSON.parse(props.customId);
    return extendObj.buttons || [];
  } catch (e) {
    return []; // 解析失敗時返回空數組
  }
});

const props = defineProps<Props>();

const emit = defineEmits<Emit>();
const ms = useMessage();

const { isMobile } = useBasicLayout();
let intervalId: number | undefined;

watch(
  () => props.status,
  (currentStatus) => {
    // 清除可能已經存在的定時器
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }

    // 當status為2時，啟動定時器
    if (currentStatus === 2) {
      intervalId = window.setInterval(async () => {
        // 這裡替換為你想要定期執行的操作

        await chatStore.queryActiveChatLogList();
        // 例如，可以在這裡調用 chatStore.queryActiveChatLogList();
      }, 5000); // 每5秒執行一次
    }
  },
  { immediate: true }
);

// 組件卸載時清除定時器
onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
  }
});

// 組件卸載時清除定時器，避免內存洩露
onUnmounted(() => {
  clearInterval(intervalId);
});

const textRef = ref<HTMLElement>();
const chatStore = useChatStore();
const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language));
    if (validLang) {
      const lang = language ?? '';
      return highlightBlock(
        hljs.highlight(code, { language: lang }).value,
        lang
      );
    }
    return highlightBlock(hljs.highlightAuto(code).value, '');
  },
});

const fileInfo = computed(() => props.fileInfo);

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } });
mdi.use(mdKatex, {
  blockClass: 'katexmath-block rounded-md p-[10px]',
  errorColor: ' #cc0000',
});

const text = computed(() => {
  const value = props.text ?? '';
  if (!props.asRawText) return mdi.render(value);
  return value;
});

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t(
    'chat.copyCode'
  )}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
}

function handleCopy() {
  emit('copy');
}

function handleDelete() {
  emit('delete');
}

/* 遞交放大繪製任務 */
async function handleUpsample(order: number) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);
    const button = extendObj.find((btn) =>
      btn.customId.includes(`upsample::${order}`)
    );
    if (button) {
      const drawCustomId = button.customId;
      // ms.success('遞交放大繪製任務成功、請等待繪製結束！');
      await onConversation({
        msg:
          t('chat.enlargeImagePrefix') + order + t('chat.enlargeImageSuffix'),
        action: 'UPSCALE',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
    }
  } catch (error) {
    // ms.error('遞交放大繪製任務失敗');
  }
}

/* 遞交變換繪製任務 */
async function handleVariation(order: number) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);
    const button = extendObj.find((btn) =>
      btn.customId.includes(`variation::${order}`)
    );
    if (button) {
      const drawCustomId = button.customId;
      // ms.success('遞交變換繪製任務成功、請等待繪製結束！');
      await onConversation({
        msg:
          t('chat.transformImagePrefix') +
          order +
          t('chat.transformImageSuffix'),
        action: 'UPSCALE',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
    }
  } catch (error) {
    // ms.error('遞交變換繪製任務失敗');
  }
}

/* 遞交繪製任務 */
async function handlePicReader(order: number) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);
    const button = extendObj.find((btn) =>
      btn.customId.includes(`MJ::Job::PicReader::${order}`)
    );
    if (button) {
      const drawCustomId = button.customId;
      // ms.success('遞交變換繪製任務成功、請等待繪製結束！');
      await onConversation({
        msg: `繪製第 ${order}張圖片`,
        action: 'PICREADER',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
      console.error(`未找到適配的繪製任務按鈕：MJ::Job::PicReader::${order}`);
    }
  } catch (error) {
    console.error('遞交變換繪製任務失敗', error);
  }
}

/* 遞交擴圖繪製任務 */
async function handleOutpaint(order: number) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);
    const button = extendObj.find((btn) =>
      btn.customId.includes(`Outpaint::${order}`)
    );
    if (button) {
      const drawCustomId = button.customId;
      // ms.success('遞交擴圖繪製任務成功、請等待繪製結束！');
      await onConversation({
        msg: t('chat.expandDrawing'),
        action: 'UPSCALE',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
    }
  } catch (error) {
    // ms.error('遞交擴圖繪製任務失敗');
  }
}

/* 遞交高級變換繪製任務 */
async function handleSuperVariation(order: string) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);
    const button = extendObj.find((btn) => btn.customId.includes(`${order}`));
    if (button) {
      const drawCustomId = button.customId;
      // ms.success('遞交變換繪製任務成功、請等待繪製結束！');
      await onConversation({
        msg: t('chat.advancedTransform'),
        action: 'UPSCALE',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
    }
  } catch (error) {
    // ms.error('遞交變換繪製任務失敗');
  }
}

/* 遞交平移繪製任務 */
async function handlePan(order: string) {
  try {
    let extendObj;
    extendObj = JSON.parse(props.customId);

    const button = extendObj.find((btn) =>
      btn.customId.includes(`pan_${order}`)
    );
    if (button) {
      const drawCustomId = button.customId;

      await onConversation({
        msg: t('chat.translateImage'),
        action: 'UPSCALE',
        drawId: props.drawId,
        customId: drawCustomId,
        modelType: 2,
        model: 'midjourney',
        modelName: props.modelName,
      });
    } else {
    }
  } catch (error) {}
}

defineExpose({ textRef });
</script>

<template>
  <div class="flex flex-col group w-full">
    <div ref="textRef" class="leading-relaxed break-words w-full">
      <div class="flex flex-col items-start w-full">
        <div class="w-full">
          <span v-if="status === 2 && !text" class="loading-anchor"></span>
          <div class="flex flex-col items-start">
            <div class="w-full">
              <div
                :class="[
                  'w-full markdown-body text-gray-800 dark:text-gray-400 ',
                  {
                    'markdown-body-generate':
                      status === 1 || status === 2 || !text,
                  },
                ]"
                v-html="text"
              ></div>
            </div>
          </div>

          <!-- <div v-else class="w-full whitespace-pre-wrap" v-text="text" /> -->
        </div>
      </div>
    </div>
    <div class="text-wrap rounded-lg min-w-12 text-gray-800 dark:text-gray-400">
      <div>
        <div>
          <div>
            <div
              class="my-1 flex w-auto"
              :style="{
                maxWidth: isMobile ? '100%' : '',
                maxHeight: isMobile ? '' : '30vh',
                objectFit: 'contain',
              }"
            >
              <NImage
                v-for="(imageSrc, index) in fileInfoArray"
                :key="index"
                :src="imageSrc"
                :preview-src="imageSrc"
                alt="圖片"
                class="rounded-md flex mb-1 mr-4"
                :style="{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }"
              />
            </div>
          </div>

          <div v-if="model?.includes('midjourney') && fileInfo && status === 3">
            <div
              v-if="customId?.includes('::upsample::1::')"
              class="mt-2 flex flex-wrap items-center justify-between"
            >
              <div class="flex flex-wrap w-full">
                <!-- <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-1">
                  <button
                    @click="handleUpsample(1)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.U1') }}
                  </button>
                  <button
                    @click="handleUpsample(2)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.U2') }}
                  </button>
                  <button
                    @click="handleUpsample(3)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.U3') }}
                  </button>
                  <button
                    @click="handleUpsample(4)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.U4') }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="customId?.includes('::variation::1::')"
              class="mt-2 flex items-center justify-between"
            >
              <div class="flex">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-1">
                  <button
                    @click="handleVariation(1)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.V1') }}
                  </button>
                  <button
                    @click="handleVariation(2)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.V2') }}
                  </button>
                  <button
                    @click="handleVariation(3)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.V3') }}
                  </button>
                  <button
                    @click="handleVariation(4)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.V4') }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="customId?.includes('::PicReader::')"
              class="mt-2 flex items-center justify-between"
            >
              <div class="flex">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-1">
                  <button
                    @click="handlePicReader(1)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    繪製 1️⃣
                  </button>
                  <button
                    @click="handlePicReader(2)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    繪製 2️⃣
                  </button>
                  <button
                    @click="handlePicReader(3)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    繪製 3️⃣
                  </button>
                  <button
                    @click="handlePicReader(4)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    繪製 4️⃣
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="customId?.includes('::pan_left::1::')"
              class="mt-2 flex items-center justify-between"
            >
              <div class="flex">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-1">
                  <button
                    @click="handlePan('left')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.panLeft') }}
                  </button>
                  <button
                    @click="handlePan('right')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.panRight') }}
                  </button>
                  <button
                    @click="handlePan('up')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.panUp') }}
                  </button>
                  <button
                    @click="handlePan('down')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.panDown') }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="customId?.includes('Outpaint::50')"
              class="mt-2 flex items-center justify-between"
            >
              <div class="flex">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-1">
                  <button
                    v-if="customId?.includes('Outpaint::50')"
                    @click="handleOutpaint(75)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.zoomIn15x') }}
                  </button>
                  <button
                    v-if="customId?.includes('Outpaint::50')"
                    @click="handleOutpaint(50)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.zoomIn2x') }}
                  </button>

                  <button
                    v-if="customId?.includes('low_variation')"
                    @click="handleSuperVariation('low')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.minorTransform') }}
                  </button>
                  <button
                    v-if="customId?.includes('low_variation')"
                    @click="handleSuperVariation('high')"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                  >
                    {{ t('chat.strongTransform') }}
                  </button>

                  <!-- <button
                    @click="handleVariation(drawItemInfo, 1)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800 "
                  >
                    區域重繪
                  </button> -->
                </div>
              </div>
            </div>
          </div>

          <!-- <div v-if="model?.includes('dall') && fileInfo">
            <div class="my-2 flex items-center justify-between">
              <div class="flex">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    @click="handleUpsample(1)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800 "
                  >
                    🔄 再畫一張
                  </button>
                  <button
                    @click="handleUpsample(2)"
                    class="w-24 shadow-sm rounded-md py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-100 dark:bg-gray-800 dark:ring-gray-800 "
                  >
                    🔀 換種風格
                  </button>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <div
      class="flex opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-gray-700"
    >
      <div>
        <div class="mt-1 flex">
          <button
            class="flex ml-0 items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 mr-3"
            text
            @click="handleCopy"
          >
            <Copy class="flex mr-1" />
            <span class="flex text-sm">{{ t('chat.copy') }}</span>
          </button>
          <button
            class="flex ml-0 items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 mr-3"
            text
            @click="handleDelete"
          >
            <Delete class="mr-1" />
            <span class="flex text-sm">{{ t('chat.delete') }} </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
