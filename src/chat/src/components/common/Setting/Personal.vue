<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { useAuthStore } from '@/store'
const authStore = useAuthStore()
const { userInfo, userBalance } = authStore

const loading = ref(false)
onMounted(async () => {
  getInfo()
})

async function getInfo() {
  try {
    loading.value = true
    await authStore.getUserInfo()
    loading.value = false
  }
  catch (error) {
    loading.value = false
  }
}
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">用戶郵箱</span>
        <div class="w-[200px]">
          {{ userInfo.email || "--" }}
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">用戶姓名</span>
        <div class="w-[200px]">
          {{ userInfo.username || "--" }}
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">問答餘額</span>
        <div class="w-[200px]">
          {{ userBalance.usesLeft || "0" }} 積分
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">繪畫餘額</span>
        <div class="w-[200px]">
          {{ userBalance.paintCount || "0" }} 積分
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">MJToken</span>
        <div class="w-[200px]">
          {{ userBalance.balance || "0" }} Token
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">使用金額</span>
        <div class="w-[200px]">
          {{ userBalance.useTokens || "0" }} Token
        </div>
      </div>
    </div>
  </NSpin>
</template>
