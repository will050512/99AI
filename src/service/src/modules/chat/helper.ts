/**
 * @desc 處理不同模型返回的最後一次彙總內容 輸出為相同格式  方便後面使用
 * @param keyType 模型key類型
 * @param response 模型返回的整體內容
 */
export function unifiedFormattingResponse(keyType, response, others) {
  let formatRes = {
    keyType, // 模型類型
    parentMessageId: '', // 父級對話id
    text: '', //本次回覆內容
    usage: {
      prompt_tokens: 0, //提問token
      completion_tokens: 0, // 回答token
      total_tokens: 0, // 總消耗token
    }
  }
  /* openai */
  // if([1].includes(Number(keyType))){
  const { parentMessageId } = response?.detail
  let { usage } = response?.detail
  if (!usage) {
    usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  }
  const { prompt_tokens, completion_tokens, total_tokens } = usage
  formatRes = {
    keyType,
    parentMessageId,
    text: response.text,
    usage: {
      prompt_tokens,
      completion_tokens,
      total_tokens
    }
  }
  // }

  /* 百度 */
  // if([2, 3].includes(Number(keyType))) {
  //   const { usage, text } = response
  //   const { prompt_tokens, completion_tokens, total_tokens } = usage
  //   const { model, parentMessageId } = others
  //   formatRes = {
  //     keyType,
  //     model,
  //     parentMessageId,
  //     text,
  //     usage: {
  //       prompt_tokens,
  //       completion_tokens,
  //       total_tokens
  //     }
  //   }
  // }

  return formatRes;
}

/*百度的模型不允許傳入偶數的message數組  讓round為奇數的時候 加一 */
export function addOneIfOdd(num) {
  if (num % 2 !== 0) {
    return num + 1;
  } else {
    return num;
  }
}
