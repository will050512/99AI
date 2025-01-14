<script setup lang="ts">
import settingsDefault from '@/settings.default';
import useMenuStore from '@/store/modules/menu';
import useSettingsStore from '@/store/modules/settings';
import eventBus from '@/utils/eventBus';
import { useClipboard } from '@vueuse/core';

defineOptions({
  name: 'AppSetting',
});

const route = useRoute();

const settingsStore = useSettingsStore();
const menuStore = useMenuStore();

const isShow = ref(false);

watch(
  () => settingsStore.settings.menu.menuMode,
  (value) => {
    if (value === 'single') {
      menuStore.setActived(0);
    } else {
      menuStore.setActived(route.fullPath);
    }
  }
);

onMounted(() => {
  eventBus.on('global-app-setting-toggle', () => {
    isShow.value = !isShow.value;
  });
});

const { copy, copied, isSupported } = useClipboard();

// watch(copied, (val) => {
//   if (val) {
//     Message.success('複製成功，請粘貼到 src/settings.ts 文件中！', {
//       zIndex: 2000,
//     })
//   }
// })

function isObject(value: any) {
  return typeof value === 'object' && !Array.isArray(value);
}
// 比較兩個對象，並提取出不同的部分
function getObjectDiff(
  originalObj: Record<string, any>,
  diffObj: Record<string, any>
) {
  if (!isObject(originalObj) || !isObject(diffObj)) {
    return diffObj;
  }
  const diff: Record<string, any> = {};
  for (const key in diffObj) {
    const originalValue = originalObj[key];
    const diffValue = diffObj[key];
    if (JSON.stringify(originalValue) !== JSON.stringify(diffValue)) {
      if (isObject(originalValue) && isObject(diffValue)) {
        const nestedDiff = getObjectDiff(originalValue, diffValue);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else {
        diff[key] = diffValue;
      }
    }
  }
  return diff;
}

function handleCopy() {
  copy(
    JSON.stringify(
      getObjectDiff(settingsDefault, settingsStore.settings),
      null,
      2
    )
  );
}
</script>

<template>
  <HSlideover v-model="isShow" title="應用配置">
    <div class="rounded-2 bg-rose/20 px-4 py-2 text-sm/6 c-rose">
      <p class="my-1">
        應用配置可實時預覽效果，但只是臨時生效，要想真正應用於項目，可以點擊下方的「複製配置」按鈕，並將配置粘貼到
        src/settings.ts 文件中。
      </p>
      <p class="my-1">注意：在生產環境中應關閉該模塊。</p>
    </div>
    <div class="divider">顏色主題風格</div>
    <div class="flex items-center justify-center pb-4">
      <HTabList
        v-model="settingsStore.settings.app.colorScheme"
        :options="[
          { icon: 'i-ri:sun-line', label: '明亮', value: 'light' },
          { icon: 'i-ri:moon-line', label: '暗黑', value: 'dark' },
          { icon: 'i-codicon:color-mode', label: '系統', value: '' },
        ]"
        class="w-60"
      />
    </div>
    <div v-if="settingsStore.mode === 'pc'" class="divider">導航欄模式</div>
    <div v-if="settingsStore.mode === 'pc'" class="menu-mode">
      <HTooltip text="側邊欄模式 (含主導航)" placement="bottom" :delay="500">
        <div
          class="mode mode-side"
          :class="{ active: settingsStore.settings.menu.menuMode === 'side' }"
          @click="settingsStore.settings.menu.menuMode = 'side'"
        >
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="頂部模式" placement="bottom" :delay="500">
        <div
          class="mode mode-head"
          :class="{ active: settingsStore.settings.menu.menuMode === 'head' }"
          @click="settingsStore.settings.menu.menuMode = 'head'"
        >
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="側邊欄模式 (不含主導航)" placement="bottom" :delay="500">
        <div
          class="mode mode-single"
          :class="{ active: settingsStore.settings.menu.menuMode === 'single' }"
          @click="settingsStore.settings.menu.menuMode = 'single'"
        >
          <div class="mode-container" />
        </div>
      </HTooltip>
    </div>
    <div class="divider">導航欄</div>
    <div class="setting-item">
      <div class="label">
        主導航切換跳轉
        <HTooltip
          text="開啟該功能後，切換主導航時，頁面自動跳轉至該主導航下，次導航裡第一個導航"
        >
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle
        v-model="settingsStore.settings.menu.switchMainMenuAndPageJump"
        :disabled="['single'].includes(settingsStore.settings.menu.menuMode)"
      />
    </div>
    <div class="setting-item">
      <div class="label">
        次導航保持展開一個
        <HTooltip text="開啟該功能後，次導航只保持單個菜單的展開">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.menu.subMenuUniqueOpened" />
    </div>
    <div class="setting-item">
      <div class="label">次導航是否摺疊</div>
      <HToggle v-model="settingsStore.settings.menu.subMenuCollapse" />
    </div>
    <div v-if="settingsStore.mode === 'pc'" class="setting-item">
      <div class="label">顯示次導航摺疊按鈕</div>
      <HToggle
        v-model="settingsStore.settings.menu.enableSubMenuCollapseButton"
      />
    </div>
    <div class="setting-item">
      <div class="label">是否啟用快捷鍵</div>
      <HToggle
        v-model="settingsStore.settings.menu.enableHotkeys"
        :disabled="['single'].includes(settingsStore.settings.menu.menuMode)"
      />
    </div>
    <div class="divider">頂欄</div>
    <div class="setting-item">
      <div class="label">模式</div>
      <HCheckList
        v-model="settingsStore.settings.topbar.mode"
        :options="[
          { label: '靜止', value: 'static' },
          { label: '固定', value: 'fixed' },
          { label: '粘性', value: 'sticky' },
        ]"
      />
    </div>
    <div>
      <div class="divider">標籤欄</div>
      <div class="setting-item">
        <div class="label">是否啟用</div>
        <HToggle v-model="settingsStore.settings.tabbar.enable" />
      </div>
      <div class="setting-item">
        <div class="label">是否顯示圖標</div>
        <HToggle
          v-model="settingsStore.settings.tabbar.enableIcon"
          :disabled="!settingsStore.settings.tabbar.enable"
        />
      </div>
      <div class="setting-item">
        <div class="label">是否啟用快捷鍵</div>
        <HToggle
          v-model="settingsStore.settings.tabbar.enableHotkeys"
          :disabled="!settingsStore.settings.tabbar.enable"
        />
      </div>
    </div>
    <div class="divider">工具欄</div>
    <div v-if="settingsStore.mode === 'pc'" class="setting-item">
      <div class="label">麵包屑導航</div>
      <HToggle v-model="settingsStore.settings.toolbar.breadcrumb" />
    </div>
    <div class="setting-item">
      <div class="label">
        導航搜索
        <HTooltip text="對導航進行快捷搜索">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.toolbar.navSearch" />
    </div>
    <div v-if="settingsStore.mode === 'pc'" class="setting-item">
      <div class="label">全屏</div>
      <HToggle v-model="settingsStore.settings.toolbar.fullscreen" />
    </div>
    <div class="setting-item">
      <div class="label">
        頁面刷新
        <HTooltip text="使用框架內提供的刷新功能進行頁面刷新">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.toolbar.pageReload" />
    </div>
    <div class="setting-item">
      <div class="label">
        顏色主題
        <HTooltip text="開啟後可在明亮/暗黑模式中切換">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.toolbar.colorScheme" />
    </div>
    <div class="divider">頁面</div>
    <div class="setting-item">
      <div class="label">是否啟用快捷鍵</div>
      <HToggle v-model="settingsStore.settings.mainPage.enableHotkeys" />
    </div>
    <div class="divider">導航搜索</div>
    <div class="setting-item">
      <div class="label">是否啟用快捷鍵</div>
      <HToggle
        v-model="settingsStore.settings.navSearch.enableHotkeys"
        :disabled="!settingsStore.settings.toolbar.navSearch"
      />
    </div>
    <div class="divider">底部版權</div>
    <div class="setting-item">
      <div class="label">是否啟用</div>
      <HToggle v-model="settingsStore.settings.copyright.enable" />
    </div>
    <div class="setting-item">
      <div class="label">日期</div>
      <HInput
        v-model="settingsStore.settings.copyright.dates"
        :disabled="!settingsStore.settings.copyright.enable"
      />
    </div>
    <div class="setting-item">
      <div class="label">公司</div>
      <HInput
        v-model="settingsStore.settings.copyright.company"
        :disabled="!settingsStore.settings.copyright.enable"
      />
    </div>
    <div class="setting-item">
      <div class="label">網址</div>
      <HInput
        v-model="settingsStore.settings.copyright.website"
        :disabled="!settingsStore.settings.copyright.enable"
      />
    </div>
    <div class="setting-item">
      <div class="label">備案</div>
      <HInput
        v-model="settingsStore.settings.copyright.beian"
        :disabled="!settingsStore.settings.copyright.enable"
      />
    </div>
    <div class="divider">主頁</div>
    <div class="setting-item">
      <div class="label">
        是否啟用
        <HTooltip
          text="該功能開啟時，登錄成功默認進入主頁，反之則默認進入導航欄裡第一個導航頁面"
        >
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.home.enable" />
    </div>
    <div class="setting-item">
      <div class="label">
        主頁名稱
        <HTooltip text="開啟國際化時，該設置無效">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HInput v-model="settingsStore.settings.home.title" />
    </div>
    <div class="divider">其它</div>
    <div class="setting-item">
      <div class="label">是否啟用權限</div>
      <HToggle v-model="settingsStore.settings.app.enablePermission" />
    </div>
    <div class="setting-item">
      <div class="label">
        載入進度條
        <HTooltip text="該功能開啟時，跳轉路由會看到頁面頂部有進度條">
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.app.enableProgress" />
    </div>
    <div class="setting-item">
      <div class="label">
        動態標題
        <HTooltip
          text="該功能開啟時，頁面標題會顯示當前路由標題，格式為“頁面標題 - 網站名稱”；關閉時則顯示網站名稱，網站名稱在項目根目錄下 .env.* 文件裡配置"
        >
          <SvgIcon name="i-ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="settingsStore.settings.app.enableDynamicTitle" />
    </div>
    <template v-if="isSupported" #footer>
      <HButton block @click="handleCopy">
        <SvgIcon name="i-ep:document-copy" />
        複製配置
      </HButton>
    </template>
  </HSlideover>
</template>

<style lang="scss" scoped>
.divider {
  --at-apply: flex items-center justify-between gap-4 my-4 whitespace-nowrap
    text-sm font-500;

  &::before,
  &::after {
    --at-apply: content-empty w-full h-1px bg-stone-2 dark-bg-stone-6;
  }
}

.menu-mode {
  --at-apply: flex items-center justify-center gap-4 pb-4;

  .mode {
    --at-apply: relative w-16 h-12 rounded-2 ring-1 ring-stone-2
      dark-ring-stone-7 cursor-pointer transition;

    &.active {
      --at-apply: ring-ui-primary ring-2;
    }

    &::before,
    &::after,
    .mode-container {
      --at-apply: absolute pointer-events-none;
    }

    &::before {
      --at-apply: content-empty bg-ui-primary;
    }

    &::after {
      --at-apply: content-empty bg-ui-primary/60;
    }

    .mode-container {
      --at-apply: bg-ui-primary/20 border-dashed border-ui-primary;

      &::before {
        --at-apply: content-empty absolute w-full h-full;
      }
    }

    &-side {
      &::before {
        --at-apply: top-2 bottom-2 left-2 w-2 rounded-tl-1 rounded-bl-1;
      }

      &::after {
        --at-apply: top-2 bottom-2 left-4.5 w-3;
      }

      .mode-container {
        --at-apply: inset-t-2 inset-r-2 inset-b-2 inset-l-8 rounded-tr-1
          rounded-br-1;
      }
    }

    &-head {
      &::before {
        --at-apply: top-2 left-2 right-2 h-2 rounded-tl-1 rounded-tr-1;
      }

      &::after {
        --at-apply: top-4.5 left-2 bottom-2 w-3 rounded-bl-1;
      }

      .mode-container {
        --at-apply: inset-t-4.5 inset-r-2 inset-b-2 inset-l-5.5 rounded-br-1;
      }
    }

    &-single {
      &::after {
        --at-apply: top-2 left-2 bottom-2 w-3 rounded-tl-1 rounded-bl-1;
      }

      .mode-container {
        --at-apply: inset-t-2 inset-r-2 inset-b-2 inset-l-5.5 rounded-tr-1
          rounded-br-1;
      }
    }
  }
}

.setting-item {
  --at-apply: flex items-center justify-between gap-4 px-4 py-2 rounded-2
    transition hover-bg-stone-1 dark-hover-bg-stone-9;

  .label {
    --at-apply: flex items-center flex-shrink-0 gap-2 text-sm;

    i {
      --at-apply: text-xl text-orange cursor-help;
    }
  }
}
</style>
