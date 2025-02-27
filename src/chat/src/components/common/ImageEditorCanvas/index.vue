<template>
  <div>
    <canvas ref="canvas" @click="handleClick" crossOrigin="anonymous"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

// 定義接收的屬性
const props = defineProps({
  src: String,
	selectColor: String,
	maxSteps: Number,
	updateFileInfo: Function
});

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
let modifiedPixels = new Set<string>();
const history = ref<ImageData[]>([]);
const maxHistorySteps = ref(10)

watch(() => props.maxSteps, (val) => {
	val && (maxHistorySteps.value = val)
}, { immediate: true })
// 初始化canvas
onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d', { willReadFrequently: true });
    initCanvas();
  }
});

// 監聽src屬性變化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    initCanvas();
  }
});

// 初始化Canvas函數
function initCanvas(){
  if (!ctx.value || !props.src) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    canvas.value!.width = img.width;
    canvas.value!.height = img.height;
		props.updateFileInfo?.({
			width: img.width,
			height: img.height,
			scaleRatio: 1,
		})
    ctx.value!.drawImage(img, 0, 0, img.width, img.height);
  };
  img.src = props.src;
};

// 獲取下標
function pointToIndex (x: number, y: number) {
  return (y * canvas.value!.width + x) * 4;
};

// 獲取顏色
function getColor(x: number, y: number, imgData: Uint8ClampedArray) {
  const i = pointToIndex(x, y);
  return [
    imgData[i],
    imgData[i + 1],
    imgData[i + 2],
    imgData[i + 3],
  ];
};

function diff (color1: number[], color2: number[]) {
    const sum =  color1.reduce((sum, value, index) => sum + Math.abs(value - color2[index]), 0);
    return sum;
};

// 修改顏色
function changeColor (initX: number, initY: number, targetColor: number[], clickColor: number[], imgData: Uint8ClampedArray){
	// 保存當前狀態
  if (ctx.value && canvas.value) {
    const currentImageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height);
		addAction(currentImageData)
  }
  const queue = [[initX, initY]];
  while(queue.length) {
    const [x, y] = queue.shift()!;
    if(x < 0 || x >= canvas.value!.width || y < 0 || y >= canvas.value!.height) continue;
    const curColor = getColor(x, y, imgData);
    if(diff(curColor, clickColor) > 50) continue;
    if(diff(curColor, targetColor) === 0) continue;
    const i = pointToIndex(x, y);
    imgData.set(targetColor, i);
    modifiedPixels.add(x + "," + y);
    queue.push([x+1, y]);
    queue.push([x-1, y]);
    queue.push([x, y+1]);
    queue.push([x, y-1]);
  }
};

/* 點選圖片換色 */
function handleClick(e: MouseEvent){
  if (!ctx.value || !canvas.value) return;
  const x = e.offsetX;
  const y = e.offsetY;
  const imageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height);
  const clickColor = getColor(x, y, imageData.data);
  const color = parseColor(props.selectColor);
  changeColor(x, y, color, clickColor, imageData.data);
  ctx.value.putImageData(imageData, 0, 0);
};

/* 獲得base64 */
function exportToBase64WithCustomBackground() {
  if (!ctx.value || !canvas.value) return '';
  const originalImageData = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height);
  const copiedData = new Uint8ClampedArray(originalImageData.data);
  for (let y = 0; y < canvas.value.height; y++) {
    for (let x = 0; x < canvas.value.width; x++) {
      const i = pointToIndex(x, y);
      if (modifiedPixels.has(x + "," + y)) {
        copiedData[i] = 255;
        copiedData[i + 1] = 255;
        copiedData[i + 2] = 255;
      } else {
        copiedData[i] = 0;
        copiedData[i + 1] = 0;
        copiedData[i + 2] = 0;
      }
      copiedData[i + 3] = 255;
    }
  }
  const newImageData = new ImageData(copiedData, canvas.value.width, canvas.value.height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.value.width;
  tempCanvas.height = canvas.value.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(newImageData, 0, 0);
  return tempCanvas.toDataURL("image/png");
};
/* 格式化傳入顏色 */
function parseColor(selectColor: string): number[]{
  if (selectColor && selectColor.startsWith('#')) {
    const extendedHex = selectColor.length === 4 ? '#' + selectColor[1] + selectColor[1] + selectColor[2] + selectColor[2] + selectColor[3] + selectColor[3] : selectColor;
    const r = parseInt(extendedHex.slice(1, 3), 16);
    const g = parseInt(extendedHex.slice(3, 5), 16);
    const b = parseInt(extendedHex.slice(5, 7), 16);
    return [r, g, b, 255];
  }
  else if (selectColor && selectColor.startsWith('rgb')) {
    const rgbValues = selectColor
      .replace(/rgba?\(/, '')
      .replace(/\)/, '')
      .split(',')
      .map((num) => parseInt(num));
    if (rgbValues.length === 3) rgbValues.push(255);  // 如果沒有 alpha，添加一個默認的不透明度
    return rgbValues;
  }
  return [0, 0, 0, 255];
};
/* 對外提供base64格式的遮罩 */
async function getBase(){
	return await exportToBase64WithCustomBackground()
}
/* 返回上一步 */
function undo() {
	if(history.value.length === 0 || !ctx.value || !canvas.value) return;
  const previousState = history.value.pop();
  ctx.value.putImageData(previousState.imageData, 0, 0);
  modifiedPixels = new Set(previousState.currentModifiedPixels);
}
/* 清空畫布 */
function clear() {
  if (!ctx.value || !canvas.value) return;

  // 直接清空畫布
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 重置修改記錄和歷史記錄
  modifiedPixels.clear();
  history.value = []; // 如果您想保留初始狀態，可以重置為 [initialState]

  initCanvas();
}




/* 設置記錄棧最大儲存步數 防止儲存過多 */
function setMaxHistorySteps(steps) {
  maxHistorySteps.value = steps;
}

/* 檢測、超出限制移除老的數據 */
function addAction(imageData) {
	const currentModifiedPixels = new Set(modifiedPixels); // 創建 modifiedPixels 的一個副本
  history.value.push({ imageData, currentModifiedPixels }); // 保存 imageData 和 modifiedPixels
  if (history.value.length > maxHistorySteps.value) {
    history.value.shift();
  }
}

defineExpose({
	getBase,
	undo,
	clear
})

</script>

<style>
  /* 這裡可以添加樣式 */
</style>
