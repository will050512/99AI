import { encode } from 'gpt-tokenizer';

export const getTokenCount = async (input: any): Promise<number> => {
  let text = '';

  if (Array.isArray(input)) {
    // 如果輸入是數組，處理消息數組
    text = input.reduce((pre: string, cur: any) => {
      if (Array.isArray(cur.content)) {
        const contentText = cur.content
          .filter((item: { type: string }) => item.type === 'text')
          .map((item: { text: any }) => item.text)
          .join(' ');
        return pre + contentText;
      } else {
        return pre + (cur.content || '');
      }
    }, '');
  } else if (typeof input === 'string') {
    // 如果輸入是字串，直接處理
    text = input;
  } else if (input) {
    // 如果輸入是其他類型，將其轉換為字串處理
    text = String(input);
  }

  text = text.replace(/<\|endoftext\|>/g, '');
  return encode(text).length;
};
