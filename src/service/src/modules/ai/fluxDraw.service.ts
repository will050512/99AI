import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ChatLogService } from '../chatLog/chatLog.service';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UploadService } from '../upload/upload.service';
import { OpenAIChatService } from './openaiChat.service';
// 引入其他需要的模塊或服務

@Injectable()
export class FluxDrawService {
  private readonly logger = new Logger(FluxDrawService.name);
  constructor(
    private readonly uploadService: UploadService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly chatLogService: ChatLogService,
    private readonly openAIChatService: OpenAIChatService
  ) {}

  async fluxDraw(inputs, buildMessageFromParentMessageId) {
    Logger.log('開始遞交 Flux 繪圖任務 ', 'DrawService');
    const {
      apiKey,
      model,
      proxyUrl,
      prompt,
      extraParam,
      timeout,
      onSuccess,
      onFailure,
      groupId,
    } = inputs;

    const isDalleChat = await this.globalConfigService.getConfigs([
      'isDalleChat',
    ]);
    let drawPrompt;
    if (isDalleChat === '1') {
      try {
        Logger.log('已開啟連續繪畫模式', 'FluxDraw');
        const { messagesHistory } = await buildMessageFromParentMessageId(
          `參考上文，結合我的需求，給出繪畫描述。我的需求是：${prompt}`,
          {
            groupId,
            systemMessage:
              '你是一個繪畫提示詞生成工具，請根據用戶的要求，結合上下文，用一段文字，描述用戶需要的繪畫需求，不用包含任何禮貌性的寒暄,只需要場景的描述,可以適當聯想',
            maxModelTokens: 8000,
            maxRounds: 5,
            fileInfo: '',
          },
          this.chatLogService
        );
        drawPrompt = await this.openAIChatService.chatFree(
          prompt,
          undefined,
          messagesHistory
        );
      } catch (error) {
        console.error('調用chatFree失敗：', error);
        drawPrompt = prompt;
      }
    } else {
      drawPrompt = prompt;
    }
    const size = extraParam?.size || '1024x1024';
    let result: any = { answer: '', fileInfo: '', status: 2 };
    try {
      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${proxyUrl}/v1/images/generations`,
        timeout: timeout,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: {
          model: model,
          prompt: drawPrompt,
          size,
          // response_format: 'b64_json'
        },
      };
      // 記錄請求日誌
      Logger.log(
        `正在準備發送請求到 ${options.url}，payload: ${JSON.stringify(
          options.data
        )}, headers: ${JSON.stringify(options.headers)}`,
        'FluxDrawService'
      );
      const response: any = await axios(options);
      Logger.debug(`請求成功${JSON.stringify(response.data.data[0])}`);
      Logger.debug(`請求狀態${JSON.stringify(response.status)}`);
      const url = response.data.data[0].url;
      try {
        Logger.log(`------> 開始上傳圖片！！！`, 'DrawService');
        // 上傳圖片

        // 使用 Date 對象獲取當前日期並格式化為 YYYYMM/DD
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始，所以+1
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}${month}/${day}`;
        result.fileInfo = await this.uploadService.uploadFileFromUrl({
          url: url,
          dir: `images/dalle/${currentDate}`,
        });
        Logger.log(`圖片上傳成功，URL: ${result.fileInfo}`, 'DrawService');
      } catch (error) {
        Logger.error(`上傳圖片過程中出現錯誤: ${error}`, 'DrawService');
      }
      let revised_prompt_cn;
      try {
        revised_prompt_cn = await this.openAIChatService.chatFree(
          `根據提示詞{${drawPrompt}}, 模擬AI繪畫機器人的語氣，用中文回覆，告訴用戶已經畫好了`
        );
      } catch (error) {
        revised_prompt_cn = `${prompt} 繪製成功`;
        Logger.error('翻譯失敗: ', error);
      }
      result.answer = revised_prompt_cn;
      result.status = 3;
      onSuccess(result);
      return;
    } catch (error) {
      result.status = 5;
      onFailure(result);
      const status = error?.response?.status || 500;
      console.log('draw error: ', JSON.stringify(error), status);
      const message = error?.response?.data?.error?.message;
      if (status === 429) {
        result.text = '當前請求已過載、請稍等會兒再試試吧！';
        return result;
      }
      if (
        status === 400 &&
        message.includes('This request has been blocked by our content filters')
      ) {
        result.text = '您的請求已被系統拒絕。您的提示可能存在一些非法的文本。';
        return result;
      }
      if (
        status === 400 &&
        message.includes('Billing hard limit has been reached')
      ) {
        result.text =
          '當前模型key已被封禁、已凍結當前調用Key、嘗試重新對話試試吧！';
        return result;
      }
      if (status === 500) {
        result.text = '繪製圖片失敗，請檢查你的提示詞是否有非法描述！';
        return result;
      }
      if (status === 401) {
        result.text = '繪製圖片失敗，此次繪畫被拒絕了！';
        return result;
      }
      result.text = '繪製圖片失敗，請稍後試試吧！';
      return result;
    }
  }
}
