import { defaultsDeep } from 'lodash-es'
import type { RouteMeta } from 'vue-router'
import type { Settings } from '#/global'
import settingsDefault from '@/settings'

const useSettingsStore = defineStore(
  // 唯一ID
  'settings',
  () => {
    const settings = ref(settingsDefault)

    const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const currentColorScheme = ref<Exclude<Settings.app['colorScheme'], ''>>()
    watch(() => settings.value.app.colorScheme, (val) => {
      if (val === '') {
        prefersColorScheme.addEventListener('change', updateTheme)
      }
      else {
        prefersColorScheme.removeEventListener('change', updateTheme)
      }
    }, {
      immediate: true,
    })
    watch(() => settings.value.app.colorScheme, updateTheme, {
      immediate: true,
    })
    function updateTheme() {
      let colorScheme = settings.value.app.colorScheme
      if (colorScheme === '') {
        colorScheme = prefersColorScheme.matches ? 'dark' : 'light'
      }
      currentColorScheme.value = colorScheme
      switch (colorScheme) {
        case 'light':
          document.documentElement.classList.remove('dark')
          break
        case 'dark':
          document.documentElement.classList.add('dark')
          break
      }
    }

    watch(() => settings.value.menu.menuMode, (val) => {
      document.body.setAttribute('data-menu-mode', val)
    }, {
      immediate: true,
    })

    // 操作系統
    const os = ref<'mac' | 'windows' | 'linux' | 'other'>('other')
    const agent = navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.includes('mac os'):
        os.value = 'mac'
        break
      case agent.includes('windows'):
        os.value = 'windows'
        break
      case agent.includes('linux'):
        os.value = 'linux'
        break
    }

    // 頁面標題
    const title = ref<RouteMeta['title']>()
    // 記錄頁面標題
    function setTitle(_title: RouteMeta['title']) {
      title.value = _title
    }

    // 顯示模式
    const mode = ref<'pc' | 'mobile'>('pc')
    // 設置顯示模式
    function setMode(width: number) {
      if (settings.value.layout.enableMobileAdaptation) {
        // 先判斷 UA 是否為移動端設備（手機&平板）
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          mode.value = 'mobile'
        }
        else {
          // 如果是桌面設備，則根據頁面寬度判斷是否需要切換為移動端展示
          mode.value = width < 1024 ? 'mobile' : 'pc'
        }
      }
      else {
        mode.value = 'pc'
      }
    }

    // 切換側邊欄導航展開/收起
    function toggleSidebarCollapse() {
      settings.value.menu.subMenuCollapse = !settings.value.menu.subMenuCollapse
    }
    // 次導航是否收起（用於記錄 pc 模式下最後的狀態）
    const subMenuCollapseLastStatus = ref(settingsDefault.menu.subMenuCollapse)
    watch(() => settings.value.menu.subMenuCollapse, (val) => {
      if (mode.value === 'pc') {
        subMenuCollapseLastStatus.value = val
      }
    })
    watch(mode, (val) => {
      switch (val) {
        case 'pc':
          settings.value.menu.subMenuCollapse = subMenuCollapseLastStatus.value
          break
        case 'mobile':
          settings.value.menu.subMenuCollapse = true
          break
      }
      document.body.setAttribute('data-mode', val)
    }, {
      immediate: true,
    })

    // 設置主題顏色模式
    function setColorScheme(color: Required<Settings.app>['colorScheme']) {
      settings.value.app.colorScheme = color
    }

    // 更新應用配置
    function updateSettings(data: Settings.all, fromBase = false) {
      settings.value = defaultsDeep(data, fromBase ? settingsDefault : settings.value)
    }

    return {
      settings,
      currentColorScheme,
      os,
      title,
      setTitle,
      mode,
      setMode,
      subMenuCollapseLastStatus,
      toggleSidebarCollapse,
      setColorScheme,
      updateSettings,
    }
  },
)

export default useSettingsStore
