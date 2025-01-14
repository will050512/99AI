import type { RouteLocationRaw } from 'vue-router'
import Message from 'vue-m-message'
import useTabbarStore from '@/store/modules/tabbar'

export default function useTabbar() {
  const route = useRoute()
  const router = useRouter()

  const tabbarStore = useTabbarStore()

  function getId() {
    return route.fullPath
  }

  function open(to: RouteLocationRaw) {
    const index = tabbarStore.list.findIndex(item => item.tabId === getId())
    tabbarStore.$patch({
      leaveIndex: index,
    })
    router.push(to)
  }

  function go(delta: number) {
    const tabId = getId()
    router.go(delta)
    tabbarStore.remove(tabId)
  }

  function close(to: RouteLocationRaw) {
    const tabId = getId()
    router.push(to).then(() => {
      tabbarStore.remove(tabId)
    })
  }

  function closeById(tabId = getId()) {
    const activedTabId = getId()
    if (tabbarStore.list.some(item => item.tabId === tabId)) {
      if (tabbarStore.list.length > 1) {
        // 如果關閉的標籤正好是當前路由
        if (tabId === activedTabId) {
          const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
          if (index < tabbarStore.list.length - 1) {
            close(tabbarStore.list[index + 1].fullPath)
          }
          else {
            close(tabbarStore.list[index - 1].fullPath)
          }
        }
        else {
          tabbarStore.remove(tabId)
        }
      }
      else {
        Message.error('當前只有一個標籤頁，已阻止關閉', {
          zIndex: 2000,
        })
      }
    }
    else {
      Message.error('關閉的頁面不存在', {
        zIndex: 2000,
      })
    }
  }

  /**
   * 關閉兩側標籤頁
   */
  function closeOtherSide(tabId = getId()) {
    const activedTabId = getId()
    // 如果操作的是非當前路由標籤頁，則先跳轉到指定路由標籤頁
    if (tabId !== activedTabId) {
      const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
      router.push(tabbarStore.list[index].fullPath)
    }
    tabbarStore.removeOtherSide(tabId)
  }

  /**
   * 關閉左側標籤頁
   */
  function closeLeftSide(tabId = getId()) {
    const activedTabId = getId()
    // 如果操作的是非當前路由標籤頁，需要判斷當前標籤頁是否在指定標籤頁左側，如果是則先跳轉到指定路由標籤頁
    if (tabId !== activedTabId) {
      const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
      const activedIndex = tabbarStore.list.findIndex(item => item.tabId === activedTabId)
      if (activedIndex < index) {
        router.push(tabbarStore.list[index].fullPath)
      }
    }
    tabbarStore.removeLeftSide(tabId)
  }

  /**
   * 關閉右側標籤頁
   */
  function closeRightSide(tabId = getId()) {
    const activedTabId = getId()
    // 如果操作的是非當前路由標籤頁，需要判斷當前標籤頁是否在指定標籤頁右側，如果是則先跳轉到指定路由標籤頁
    if (tabId !== activedTabId) {
      const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
      const activedIndex = tabbarStore.list.findIndex(item => item.tabId === activedTabId)
      if (activedIndex > index) {
        router.push(tabbarStore.list[index].fullPath)
      }
    }
    tabbarStore.removeRightSide(tabId)
  }

  /**
   * 校驗指定標籤兩側是否有可關閉的標籤
   */
  function checkCloseOtherSide(tabId = getId()) {
    return tabbarStore.list.some((item) => {
      return item.tabId !== tabId
    })
  }

  /**
   * 校驗指定標籤左側是否有可關閉的標籤
   */
  function checkCloseLeftSide(tabId = getId()) {
    let flag = true
    if (tabId === tabbarStore.list[0]?.tabId) {
      flag = false
    }
    else {
      const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
      flag = tabbarStore.list.some((item, i) => {
        return i < index && item.tabId !== tabId
      })
    }
    return flag
  }

  /**
   * 校驗指定標籤右側是否有可關閉的標籤
   */
  function checkCloseRightSide(tabId = getId()) {
    let flag = true
    if (tabId === tabbarStore.list.at(-1)?.tabId) {
      flag = false
    }
    else {
      const index = tabbarStore.list.findIndex(item => item.tabId === tabId)
      flag = tabbarStore.list.some((item, i) => {
        return i >= index && item.tabId !== tabId
      })
    }
    return flag
  }

  return {
    getId,
    open,
    go,
    close,
    closeById,
    closeOtherSide,
    closeLeftSide,
    closeRightSide,
    checkCloseOtherSide,
    checkCloseLeftSide,
    checkCloseRightSide,
  }
}
