import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UploadService } from '../upload/upload.service';
// 引入其他需要的模塊或服務

@Injectable()
export class StableDiffusionService {
  private readonly logger = new Logger(StableDiffusionService.name);
  constructor(
    private readonly uploadService: UploadService,
    private readonly globalConfigService: GlobalConfigService
  ) {}

  async sdxl(inputs) {
    const {
      onSuccess,
      onFailure,
      apiKey,
      model,
      proxyUrl,
      modelName,
      timeout,
      chatId,
      prompt,
    } = inputs;
    let result = {
      answer: '',
      model: model,
      modelName: modelName,
      chatId: chatId,
      fileInfo: '',
      status: 2,
    };

    console.log('開始處理', { model, modelName, prompt }); // 打印輸入資訊

    const options = {
      method: 'POST',
      url: `${proxyUrl}/v1/chat/completions`,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model,
        messages: [{ role: 'user', content: prompt }],
      },
    };

    try {
      const response = await axios(options);
      console.log('API響應接收', response.data); // 打印API響應

      if (response.data.choices && response.data.choices.length > 0) {
        const choice = response.data.choices[0];
        const content = choice.message.content;
        console.log('處理內容', content); // 打印選項內容

        // 使用正則表達式匹配圖片鏈接
        const regex = /\]\((https?:\/\/[^\)]+)\)/;
        const match = content.match(regex);
        if (match && match[1]) {
          result.fileInfo = match[1]; // 提取鏈接並儲存在fileInfo中
          try {
            const localStorageStatus =
              await this.globalConfigService.getConfigs(['localStorageStatus']);
            if (Number(localStorageStatus)) {
              // 使用 Date 對象獲取當前日期並格式化為 YYYYMM/DD
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始，所以+1
              const day = String(now.getDate()).padStart(2, '0');
              const currentDate = `${year}${month}/${day}`;
              result.fileInfo = await this.uploadService.uploadFileFromUrl({
                url: result.fileInfo,
                dir: `images/stable-diffusion/${currentDate}`,
              });
            }
          } catch (error) {
            Logger.error(
              `上傳文件失敗: ${error.message}`,
              'StableDiffusionService'
            );
          }
          console.log('找到鏈接', match[1]); // 打印提取的鏈接
        } else {
          console.log('沒有找到鏈接');
        }
        result.answer = `${prompt} 繪製成功`;
        if (result.fileInfo) {
          onSuccess(result);
          return;
        } else {
          onFailure('No link found.');
        }
      } else {
        onFailure('No choices returned.');
      }
    } catch (error) {
      Logger.error('服務器錯誤，請求失敗：', error);
    }
  }
}
