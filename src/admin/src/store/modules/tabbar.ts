import type { RouteLocationNormalized } from 'vue-router'
import useKeepAliveStore from './keepAlive'
import type { Tabbar } from '#/global'

const useTabbarStore = defineStore(
  // 唯一ID
  'tabbar',
  () => {
    const keepAliveStore = useKeepAliveStore()

    const list = ref<Tabbar.recordRaw[]>([])
    const leaveIndex = ref(-1)

    // 添加標籤頁
    async function add(route: RouteLocationNormalized) {
      const names: string[] = []
      route.matched.forEach((v, i) => {
        if (i > 0) {
          v.components?.default.name && names.push(v.components.default.name)
        }
      })
      const meta = route.matched.at(-1)?.meta
      const tabId = route.fullPath
      if (route.name !== 'reload') {
        // 記錄查找到的標籤頁
        const findTab = list.value.find((item) => {
          if (item.routeName) {
            return item.routeName === route.name
          }
          else {
            return item.tabId === tabId
          }
        })
        // 新增標籤頁
        if (!findTab) {
          const listItem = {
            tabId,
            fullPath: route.fullPath,
            routeName: route.name,
            title: typeof meta?.title === 'function' ? meta.title() : meta?.title,
            icon: meta?.icon ?? meta?.breadcrumbNeste?.findLast(item => item.icon)?.icon,
            name: names,
          }
          if (leaveIndex.value >= 0) {
            list.value.splice(leaveIndex.value + 1, 0, listItem)
            leaveIndex.value = -1
          }
          else {
            list.value.push(listItem)
          }
        }
      }
    }
    // 刪除指定標籤頁
    function remove(tabId: Tabbar.recordRaw['tabId']) {
      const keepName: string[] = []
      const removeName: string[] = []
      list.value.forEach((v) => {
        if (v.tabId === tabId) {
          removeName.push(...v.name)
        }
        else {
          keepName.push(...v.name)
        }
      })
      const name: string[] = []
      removeName.forEach((v) => {
        if (!keepName.includes(v)) {
          name.push(v)
        }
      })
      // 如果是手動點擊關閉 tab 標籤頁，則刪除頁面緩存
      keepAliveStore.remove(name)
      list.value = list.value.filter((item) => {
        return item.tabId !== tabId
      })
    }
    // 刪除兩側標籤頁
    function removeOtherSide(tabId: Tabbar.recordRaw['tabId']) {
      const keepName: string[] = []
      const removeName: string[] = []
      list.value.forEach((v) => {
        if (v.tabId !== tabId) {
          removeName.push(...v.name)
        }
        else {
          keepName.push(...v.name)
        }
      })
      const name: string[] = []
      removeName.forEach((v) => {
        if (!keepName.includes(v)) {
          name.push(v)
        }
      })
      keepAliveStore.remove(name)
      list.value = list.value.filter((item) => {
        return item.tabId === tabId
      })
    }
    // 刪除左側標籤頁
    function removeLeftSide(tabId: Tabbar.recordRaw['tabId']) {
      // 查找指定路由對應在標籤頁列表裡的下標
      const index = list.value.findIndex(item => item.tabId === tabId)
      const keepName: string[] = []
      const removeName: string[] = []
      list.value.forEach((v, i) => {
        if (i < index) {
          removeName.push(...v.name)
        }
        else {
          keepName.push(...v.name)
        }
      })
      const name: string[] = []
      removeName.forEach((v) => {
        if (!keepName.includes(v)) {
          name.push(v)
        }
      })
      keepAliveStore.remove(name)
      list.value = list.value.filter((item, i) => {
        return i >= index
      })
    }
    // 刪除右側標籤頁
    function removeRightSide(tabId: Tabbar.recordRaw['tabId']) {
      // 查找指定路由對應在標籤頁列表裡的下標
      const index = list.value.findIndex(item => item.tabId === tabId)
      const keepName: string[] = []
      const removeName: string[] = []
      list.value.forEach((v, i) => {
        if (i > index) {
          removeName.push(...v.name)
        }
        else {
          keepName.push(...v.name)
        }
      })
      const name: string[] = []
      removeName.forEach((v) => {
        if (!keepName.includes(v)) {
          name.push(v)
        }
      })
      keepAliveStore.remove(name)
      list.value = list.value.filter((item, i) => {
        return i <= index
      })
    }
    // 清空所有標籤頁，登出的時候需要清空
    function clean() {
      list.value = []
    }

    return {
      list,
      leaveIndex,
      add,
      remove,
      removeOtherSide,
      removeLeftSide,
      removeRightSide,
      clean,
    }
  },
)

export default useTabbarStore
