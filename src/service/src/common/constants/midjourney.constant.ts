/**
 * 任務狀態枚舉 1: 等待中 2: 繪製中 3: 繪製完成 4: 繪製失敗 5: 繪製超時
 */
export enum MidjourneyStatusEnum {
  WAITING = 1,
  DRAWING = 2,
  DRAWED = 3,
  DRAWFAIL = 4,
  DRAWTIMEOUT = 5,
}

/**
 * 繪畫動作枚舉 1: 繪畫 2: 放大 3: 變換 4: 圖生圖 5: 重新生成 6： 無線縮放  7: 單張變化【很大|微小】
 */
export enum MidjourneyActionEnum {
  DRAW = 1,
  UPSCALE = 2,
  VARIATION = 3,
  GENERATE = 4,
  REGENERATE = 5,
  VARY = 6,
  ZOOM = 7,
}
