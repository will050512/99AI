<script setup lang="ts">
defineOptions({
  name: 'FixedActionBar',
})

const isBottom = ref(false)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function onScroll() {
  // 變量scrollTop是滾動條滾動時，滾動條上端距離頂部的距離
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  // 變量windowHeight是可視區的高度
  const windowHeight = document.documentElement.clientHeight || document.body.clientHeight
  // 變量scrollHeight是滾動條的總高度（當前可滾動的頁面的總高度）
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  // 滾動條到底部
  isBottom.value = Math.ceil(scrollTop + windowHeight) >= scrollHeight
}
</script>

<template>
  <div
    class="fixed-action-bar bottom-0 z-4 bg-[var(--g-container-bg)] p-5 text-center transition" :class="{ shadow: !isBottom }" data-fixed-calc-width
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.fixed-action-bar {
  box-shadow: 0 0 1px 0 var(--g-box-shadow-color);

  &.shadow {
    box-shadow: 0 -10px 10px -10px var(--g-box-shadow-color);
  }
}
</style>
