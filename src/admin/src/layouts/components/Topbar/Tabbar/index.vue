<script setup lang="ts">
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import hotkeys from 'hotkeys-js'
import Message from 'vue-m-message'
import { useMagicKeys } from '@vueuse/core'
import useSettingsStore from '@/store/modules/settings'
import useTabbarStore from '@/store/modules/tabbar'
import type { Tabbar } from '#/global'

defineOptions({
  name: 'Tabbar',
})

const route = useRoute()
const router = useRouter()

const settingsStore = useSettingsStore()
const tabbarStore = useTabbarStore()

const tabbar = useTabbar()
const mainPage = useMainPage()

const keys = useMagicKeys({ reactive: true })

const activedTabId = computed(() => tabbar.getId())

const tabsRef = ref()
const tabContainerRef = ref()
const tabRef = shallowRef<HTMLElement[]>([])
onBeforeUpdate(() => {
  tabRef.value = []
})

watch(() => route, (val) => {
  if (settingsStore.settings.tabbar.enable) {
    tabbarStore.add(val).then(() => {
      const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
      if (index !== -1) {
        scrollTo(tabRef.value[index].offsetLeft)
        tabbarScrollTip()
      }
    })
  }
}, {
  immediate: true,
  deep: true,
})
function tabbarScrollTip() {
  if (tabContainerRef.value.$el.clientWidth > tabsRef.value.clientWidth && localStorage.getItem('tabbarScrollTip') === undefined) {
    localStorage.setItem('tabbarScrollTip', '')
    Message.info('標籤欄數量超過展示區域範圍，可以將鼠標移到標籤欄上，通過鼠標滾輪滑動瀏覽', {
      title: '溫馨提示',
      duration: 5000,
      closable: true,
      zIndex: 2000,
    })
  }
}
function handlerMouserScroll(event: WheelEvent) {
  tabsRef.value.scrollBy({
    left: event.deltaY || event.detail,
  })
}
function scrollTo(offsetLeft: number) {
  tabsRef.value.scrollTo({
    left: offsetLeft - 50,
    behavior: 'smooth',
  })
}
function onTabbarContextmenu(event: MouseEvent, routeItem: Tabbar.recordRaw) {
  event.preventDefault()
  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    zIndex: 1050,
    iconFontClass: '',
    customClass: 'tabbar-contextmenu',
    items: [
      {
        label: '重新加載',
        icon: 'i-ri:refresh-line',
        disabled: routeItem.tabId !== activedTabId.value,
        onClick: () => mainPage.reload(),
      },
      {
        label: '關閉標籤頁',
        icon: 'i-ri:close-line',
        disabled: tabbarStore.list.length <= 1,
        divided: true,
        onClick: () => {
          tabbar.closeById(routeItem.tabId)
        },
      },
      {
        label: '關閉其他標籤頁',
        disabled: !tabbar.checkCloseOtherSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeOtherSide(routeItem.tabId)
        },
      },
      {
        label: '關閉左側標籤頁',
        disabled: !tabbar.checkCloseLeftSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeLeftSide(routeItem.tabId)
        },
      },
      {
        label: '關閉右側標籤頁',
        disabled: !tabbar.checkCloseRightSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeRightSide(routeItem.tabId)
        },
      },
    ],
  })
}

onMounted(() => {
  hotkeys('alt+left,alt+right,alt+w,alt+1,alt+2,alt+3,alt+4,alt+5,alt+6,alt+7,alt+8,alt+9,alt+0', (e, handle) => {
    if (settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.enableHotkeys) {
      e.preventDefault()
      switch (handle.key) {
        // 切換到當前標籤頁緊鄰的上一個標籤頁
        case 'alt+left':
          if (tabbarStore.list[0].tabId !== activedTabId.value) {
            const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
            router.push(tabbarStore.list[index - 1].fullPath)
          }
          break
        // 切換到當前標籤頁緊鄰的下一個標籤頁
        case 'alt+right':
          if (tabbarStore.list.at(-1)?.tabId !== activedTabId.value) {
            const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
            router.push(tabbarStore.list[index + 1].fullPath)
          }
          break
        // 關閉當前標籤頁
        case 'alt+w':
          tabbar.closeById(activedTabId.value)
          break
        // 切換到第 n 個標籤頁
        case 'alt+1':
        case 'alt+2':
        case 'alt+3':
        case 'alt+4':
        case 'alt+5':
        case 'alt+6':
        case 'alt+7':
        case 'alt+8':
        case 'alt+9':
        {
          const number = Number(handle.key.split('+')[1])
          tabbarStore.list[number - 1]?.fullPath && router.push(tabbarStore.list[number - 1].fullPath)
          break
        }
        // 切換到最後一個標籤頁
        case 'alt+0':
          router.push(tabbarStore.list[tabbarStore.list.length - 1].fullPath)
          break
      }
    }
  })
})
onUnmounted(() => {
  hotkeys.unbind('alt+left,alt+right,alt+w,alt+1,alt+2,alt+3,alt+4,alt+5,alt+6,alt+7,alt+8,alt+9,alt+0')
})
</script>

<template>
  <div class="tabbar-container">
    <div ref="tabsRef" class="tabs" @wheel.prevent="handlerMouserScroll">
      <TransitionGroup ref="tabContainerRef" name="tabbar" tag="div" class="tab-container">
        <div
          v-for="(element, index) in tabbarStore.list" :key="element.tabId"
          ref="tabRef" :data-index="index" class="tab" :class="{
            actived: element.tabId === activedTabId,
          }" :title="typeof element?.title === 'function' ? element.title() : element.title" @click="router.push(element.fullPath)" @contextmenu="onTabbarContextmenu($event, element)"
        >
          <div class="tab-dividers" />
          <div class="tab-background" />
          <div class="tab-content">
            <div :key="element.tabId" class="title">
              <SvgIcon v-if="settingsStore.settings.tabbar.enableIcon && element.icon" :name="element.icon" class="icon" />
              {{ typeof element?.title === 'function' ? element.title() : element.title }}
            </div>
            <div v-if="tabbarStore.list.length > 1" class="action-icon" @click.stop="tabbar.closeById(element.tabId)">
              <SvgIcon name="i-ri:close-fill" />
            </div>
            <div v-show="keys.alt && index < 9" class="hotkey-number">
              {{ index + 1 }}
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss">
.tabbar-contextmenu {
  z-index: 1000;

  .mx-context-menu {
    --at-apply: fixed ring-1 ring-stone-2 dark-ring-stone-7 shadow-2xl;

    background-color: var(--g-container-bg);

    .mx-context-menu-items .mx-context-menu-item {
      --at-apply: transition-background-color;

      &:not(.disabled):hover {
        --at-apply: cursor-pointer bg-stone-1 dark-bg-stone-9;
      }

      span {
        color: initial;
      }

      .icon {
        color: initial;
      }

      &.disabled span,
      &.disabled .icon {
        opacity: 0.25;
      }
    }

    .mx-context-menu-item-sperator {
      background-color: var(--g-container-bg);

      &::after {
        --at-apply: bg-stone-2 dark-bg-stone-7;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.tabbar-container {
  position: relative;
  height: var(--g-tabbar-height);
  background-color: var(--g-bg);
  transition: background-color 0.3s;

  .tabs {
    position: absolute;
    right: 0;
    left: 0;
    overflow-y: hidden;
    white-space: nowrap;

    // firefox隱藏滾動條
    scrollbar-width: none;

    // chrome隱藏滾動條
    &::-webkit-scrollbar {
      display: none;
    }

    .tab-container {
      display: inline-block;

      .tab {
        position: relative;
        display: inline-block;
        width: 150px;
        height: var(--g-tabbar-height);
        font-size: 14px;
        line-height: calc(var(--g-tabbar-height) - 2px);
        vertical-align: bottom;
        pointer-events: none;
        cursor: pointer;

        &:not(.actived):hover {
          z-index: 3;

          &::before,
          &::after {
            content: none;
          }

          & + .tab .tab-dividers::before {
            opacity: 0;
          }

          .tab-content {
            .title,
            .action-icon {
              color: var(--g-tabbar-tab-hover-color);
            }
          }

          .tab-background {
            background-color: var(--g-tabbar-tab-hover-bg);
          }
        }

        * {
          user-select: none;
        }

        &.actived {
          z-index: 5;

          &::before,
          &::after {
            content: none;
          }

          & + .tab .tab-dividers::before {
            opacity: 0;
          }

          .tab-content {
            .title,
            .action-icon {
              color: var(--g-tabbar-tab-active-color);
            }
          }

          .tab-background {
            background-color: var(--g-container-bg);
          }
        }

        .tab-dividers {
          position: absolute;
          top: 50%;
          right: -1px;
          left: -1px;
          z-index: 0;
          height: 14px;
          transform: translateY(-50%);

          &::before {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 1px;
            display: block;
            width: 1px;
            content: "";
            background-color: var(--g-tabbar-dividers-bg);
            opacity: 1;
            transition: opacity 0.2s ease, background-color 0.3s;
          }
        }

        &:first-child .tab-dividers::before {
          opacity: 0;
        }

        .tab-background {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transition: opacity 0.3s, background-color 0.3s;
        }

        .tab-content {
          display: flex;
          width: 100%;
          height: 100%;
          pointer-events: all;

          .title {
            display: flex;
            flex: 1;
            gap: 5px;
            align-items: center;
            height: 100%;
            padding: 0 10px;
            margin-right: 10px;
            overflow: hidden;
            color: var(--g-tabbar-tab-color);
            white-space: nowrap;
            mask-image: linear-gradient(to right, #000 calc(100% - 20px), transparent);
            transition: margin-right 0.3s;

            &:has(+ .action-icon) {
              margin-right: 28px;
            }

            .icon {
              flex-shrink: 0;
            }
          }

          .action-icon {
            position: absolute;
            top: 50%;
            right: 0.5em;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.5em;
            height: 1.5em;
            font-size: 12px;
            color: var(--g-tabbar-tab-color);
            border-radius: 50%;
            transform: translateY(-50%);

            &:hover {
              --at-apply: ring-1 ring-stone-3 dark-ring-stone-7;

              background-color: var(--g-bg);
            }
          }

          .hotkey-number {
            --at-apply: ring-1 ring-stone-3 dark-ring-stone-7;

            position: absolute;
            top: 50%;
            right: 0.5em;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.5em;
            height: 1.5em;
            font-size: 12px;
            color: var(--g-tabbar-tab-color);
            background-color: var(--g-bg);
            border-radius: 50%;
            transform: translateY(-50%);
          }
        }
      }
    }
  }
}

// 標籤欄動畫
.tabs {
  .tabbar-move,
  .tabbar-enter-active,
  .tabbar-leave-active {
    transition: all 0.3s;
  }

  .tabbar-enter-from,
  .tabbar-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  .tabbar-leave-active {
    position: absolute !important;
  }
}
</style>
