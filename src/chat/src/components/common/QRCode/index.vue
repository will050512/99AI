<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
/*
  參考文檔：https://vueuse.org/integrations/useQRCode/
  https://www.npmjs.com/package/qrcode#qr-code-options
*/
interface Props {
  value?: string // 掃描後的文本或地址
  size?: number // 二維碼大小
  color?: string // 二維碼顏色，Value must be in hex format (十六進制顏色值)
  backgroundColor?: string // 二維碼背景色，Value must be in hex format (十六進制顏色值)
  bordered?: boolean // 是否有邊框
  borderColor?: string // 邊框顏色
  scale?: number // 每個black dots多少像素
  /*
    糾錯等級也叫糾錯率，就是指二維碼可以被遮擋後還能正常掃描，而這個能被遮擋的最大面積就是糾錯率。
    通常情況下二維碼分為 4 個糾錯級別：L級 可糾正約 7% 錯誤、M級 可糾正約 15% 錯誤、Q級 可糾正約 25% 錯誤、H級 可糾正約30% 錯誤。
    並不是所有位置都可以缺損，像最明顯的三個角上的方框，直接影響初始定位。中間零散的部分是內容編碼，可以容忍缺損。
    當二維碼的內容編碼攜帶資訊比較少的時候，也就是鏈接比較短的時候，設置不同的糾錯等級，生成的圖片不會發生變化。
  */
  errorLevel?: string // 二維碼糾錯等級
}
const props = withDefaults(defineProps<Props>(), {
  value: '',
  size: 160,
  color: '#000',
  backgroundColor: '#FFF',
  bordered: true,
  borderColor: '#0505050f',
  scale: 8,
  errorLevel: 'H', // 可選 L M Q H
})

// `qrcode` will be a ref of data URL
const qrcode = useQRCode(props.value, {
  errorCorrectionLevel: props.errorLevel,
  type: 'image/png',
  quality: 1,
  margin: 3,
  scale: props.scale, // 8px per modules(black dots)
  color: {
    dark: props.color, // 像素點顏色
    light: props.backgroundColor, // 背景色
  },
})
</script>

<template>
  <div class="m-qrcode" :class="{ bordered }" :style="`width: ${size}px; height: ${size}px; border-color: ${borderColor};`">
    <img :src="qrcode" class="u-qrcode" alt="QRCode">
  </div>
</template>

<style lang="less" scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.m-qrcode {
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  .u-qrcode {
    width: 100%;
    height: 100%;
  }
}
.bordered {
  border-width: 1px;
  border-style: solid;
}
</style>
