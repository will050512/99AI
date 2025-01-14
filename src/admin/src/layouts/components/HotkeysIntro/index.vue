<script setup lang="ts">
import eventBus from '@/utils/eventBus'
import useSettingsStore from '@/store/modules/settings'

defineOptions({
  name: 'HotkeysIntro',
})

const isShow = ref(false)

const settingsStore = useSettingsStore()

onMounted(() => {
  eventBus.on('global-hotkeys-intro-toggle', () => {
    isShow.value = !isShow.value
  })
})
</script>

<template>
  <HDialog v-model="isShow" title="快捷鍵介紹">
    <div class="px-4">
      <div class="grid gap-2 sm-grid-cols-2">
        <div>
          <h2 class="m-0 text-lg font-bold">
            全局
          </h2>
          <ul class="list-none pl-4 text-sm">
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>I</HKbd>
              查看系統資訊
            </li>
            <li v-if="settingsStore.settings.toolbar.navSearch && settingsStore.settings.navSearch.enableHotkeys" class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>S</HKbd>
              喚起導航搜索
            </li>
          </ul>
        </div>
        <div v-if="settingsStore.settings.menu.enableHotkeys && ['side', 'head'].includes(settingsStore.settings.menu.menuMode)">
          <h2 class="m-0 text-lg font-bold">
            主導航
          </h2>
          <ul class="list-none pl-4 text-sm">
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>`</HKbd>
              激活下一個主導航
            </li>
          </ul>
        </div>
        <div v-if="settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.enableHotkeys">
          <h2 class="m-0 text-lg font-bold">
            標籤欄
          </h2>
          <ul class="list-none pl-4 text-sm">
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>←</HKbd>
              切換到上一個標籤頁
            </li>
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>→</HKbd>
              切換到下一個標籤頁
            </li>
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>W</HKbd>
              關閉當前標籤頁
            </li>
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>1~9</HKbd>
              切換到第 n 個標籤頁
            </li>
            <li class="py-1">
              <HKbd>{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }}</HKbd>
              <HKbd>0</HKbd>
              切換到最後一個標籤頁
            </li>
          </ul>
        </div>
      </div>
    </div>
  </HDialog>
</template>
