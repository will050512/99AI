import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ChatLogService } from '../chatLog/chatLog.service';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UploadService } from '../upload/upload.service';
// 引入其他需要的模塊或服務

@Injectable()
export class MidjourneyService {
  constructor(
    private readonly uploadService: UploadService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly chatLogService: ChatLogService
  ) {}

  /* MJ 繪畫 */
  async midjourneyDraw(inputs) {
    const {
      id,
      apiKey,
      proxyUrl,
      action,
      drawId,
      prompt,
      usePrompt,
      customId,
      timeout,
      fileInfo,
      assistantLogId,
    } = inputs;
    let result: any = {
      text: '',
      fileInfo: '',
      drawId: '',
      customId: '',
      status: 2,
    };

    /* 遞交繪畫任務 */
    let response: AxiosResponse<any, any>;
    let retryCount = 0;
    let url = '';
    const headers = { 'mj-api-secret': apiKey };
    Logger.debug(`當前任務類型: ${action}`, 'MidjourneyService');
    while (retryCount < 3) {
      let payloadJson = {};
      try {
        if (action === 'IMAGINE') {
          url = `${proxyUrl}/mj/submit/imagine`;
          payloadJson = { prompt: usePrompt };
        } else if (action === 'DESCRIBE') {
          url = `${proxyUrl}/mj/submit/describe`;

          if (fileInfo) {
            const response = await fetch(fileInfo);
            const blob = await response.blob();
            const buffer = Buffer.from(await blob.arrayBuffer());
            const base64String = buffer.toString('base64');
            payloadJson = { base64: `data:image/png;base64,${base64String}` };
          } else {
            return;
          }
        } else if (action === 'PICREADER') {
          url = `${proxyUrl}/mj/submit/action`;
          payloadJson = { taskId: drawId, customId: customId };
          response = await axios.post(url, payloadJson, { headers });
          if (response?.status === 200 && response?.data?.result) {
            url = `${proxyUrl}/mj/submit/modal`;
            payloadJson = { taskId: response?.data?.result };
          }
        } else {
          url = `${proxyUrl}/mj/submit/action`;
          payloadJson = { taskId: drawId, customId: customId };
        }

        // 在發送請求之前記錄請求的詳細資訊
        Logger.log(
          `正在準備發送請求到 ${url}，payload: ${JSON.stringify(
            payloadJson
          )}, headers: ${JSON.stringify(headers)}`,
          'MidjourneyService'
        );

        response = await axios.post(url, payloadJson, { headers });

        if (response?.status === 200 && response?.data?.result) {
          Logger.debug(
            `收到響應: ${JSON.stringify(response.data)}`,
            'MidjourneyService'
          );
          result.drawId = response?.data?.result;
          result.state = 2;
          result.answer = '繪畫任務遞交成功';
          Logger.log(
            `繪畫任務遞交成功, 繪畫ID: ${response.data.result}`,
            'MidjourneyService'
          );
          break;
        } else {
          throw new Error('未能獲取結果數據, 即將重試');
        }
      } catch (error) {
        retryCount++;
        if (retryCount >= 3) {
          result.answer = '任務遞交失敗，請檢查提示詞後重試';
          result.status = 5;
          Logger.log(
            `繪畫任務遞交失敗, 請檢查後臺配置或者稍後重試! ${error}`,
            'MidjourneyService'
          );
        }
      }
    }

    this.pollMjDrawingResult({
      proxyUrl,
      apiKey,
      drawId: result.drawId,
      timeout,
      prompt,
      onSuccess: async (data) => {
        // 處理成功獲取繪圖結果的邏輯
        await this.chatLogService.updateChatLog(assistantLogId, {
          fileInfo: data?.fileInfo,
          answer: data?.answer || prompt,
          progress: '100%',
          status: 3,
          drawId: data?.drawId,
          customId: data?.customId,
        });
        Logger.log('繪圖成功！', 'MidjourneyService');
      },
      onDrawing: async (data) => {
        // 處理成功獲取繪圖結果的邏輯
        await this.chatLogService.updateChatLog(assistantLogId, {
          answer: data?.answer || '繪製中',
          progress: data?.progress,
          status: 2,
        });
        Logger.log(`繪製中！繪製進度${data?.progress}`, 'MidjourneyService');
      },
      onFailure: async (data) => {
        // 處理失敗邏輯
        await this.chatLogService.updateChatLog(assistantLogId, {
          answer: '繪圖失敗',
          status: data.status,
        });
        Logger.log('繪圖失敗', 'MidjourneyService');
      },
    }).catch((error) => {
      Logger.error('查詢繪圖結果時發生錯誤:', error, 'MidjourneyService');
    });

    return result;
  }

  async pollMjDrawingResult(inputs) {
    const {
      proxyUrl,
      apiKey,
      drawId,
      timeout,
      onSuccess,
      prompt,
      onFailure,
      onDrawing,
    } = inputs;
    const { mjNotSaveImg, mjProxyImgUrl, mjNotUseProxy } =
      await this.globalConfigService.getConfigs([
        'mjNotSaveImg',
        'mjProxyImgUrl',
        'mjNotUseProxy',
      ]);
    let result: any = {
      fileInfo: '',
      drawId: '',
      customId: '',
      status: 2,
      progress: 0,
      answer: '',
    };
    const startTime = Date.now();
    const POLL_INTERVAL = 5000; // 每5秒查一次
    let retryCount = 0; // 當前重試次數
    try {
      while (Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        try {
          const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'mj-api-secret': apiKey,
          };
          const url = `${proxyUrl}/mj/task/${drawId}/fetch`;
          const res = await axios.get(url, { headers });
          const responses = res.data;
          Logger.debug(
            `查詢結果: ${JSON.stringify(responses)}`,
            'MidjourneyService'
          );
          if (responses.status === 'SUCCESS') {
            Logger.log(
              `繪製成功, 獲取到的URL: ${responses.imageUrl}`,
              'MidjourneyService'
            );

            let processedUrl = responses.imageUrl; // 初始化處理後的URL為原始URL
            const shouldReplaceUrl = mjNotUseProxy === '0' && mjProxyImgUrl; // 判斷是否需要替換URL
            let logMessage = ''; // 初始化日誌消息變量

            if (shouldReplaceUrl) {
              const newUrlBase = new URL(mjProxyImgUrl);
              const parsedUrl = new URL(responses.imageUrl);
              // 替換協議和網域名稱
              parsedUrl.protocol = newUrlBase.protocol;
              parsedUrl.hostname = newUrlBase.hostname;
              parsedUrl.port = newUrlBase.port ? newUrlBase.port : '';
              processedUrl = parsedUrl.toString();
              logMessage = `使用代理替換後的 URL: ${processedUrl}`;
              Logger.log(logMessage, 'MidjourneyService');
            }

            // 根據 mjNotSaveImg 來判斷是否存圖
            if (mjNotSaveImg !== '1') {
              try {
                Logger.log(`------> 開始上傳圖片！！！`, 'MidjourneyService');

                // 使用 Date 對象獲取當前日期並格式化為 YYYYMM/DD
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始，所以+1
                const day = String(now.getDate()).padStart(2, '0');
                const currentDate = `${year}${month}/${day}`;

                processedUrl = await this.uploadService.uploadFileFromUrl({
                  url: processedUrl,
                  dir: `images/midjourney/${currentDate}`,
                });
                logMessage = `上傳成功 URL: ${processedUrl}`;
              } catch (uploadError) {
                Logger.error('儲存圖片失敗，使用原始/代理圖片鏈接');
                // 如果上傳失敗，processedUrl 已經是最新的URL，無需再次賦值
                logMessage = `儲存圖片失敗，使用原始/代理圖片鏈接 ${processedUrl}`;
              }
              Logger.log(logMessage, 'MidjourneyService');
            } else {
              // 如果不保存圖片，則直接使用處理後的URL
              logMessage = `不保存圖片，使用 URL: ${processedUrl}`;
              Logger.log(logMessage, 'MidjourneyService');
            }

            result.fileInfo = processedUrl;
            result.drawId = responses.id;
            result.customId = JSON.stringify(responses.buttons);
            result.answer = `${prompt}\n${
              responses.finalPrompt || responses.properties.finalPrompt || ''
            }`;
            // result.status = 3;
            onSuccess(result);
            return;
          }
          result.progress = responses?.progress;
          result.answer = `當前繪製進度 ${responses?.progress}`;
          if (result.progress) {
            onDrawing(result);
          }
        } catch (error) {
          retryCount++;
          Logger.error(`輪詢過程中發生錯誤: ${error}`, 'MidjourneyService');
        }
      }
      Logger.error(
        `超過 ${startTime / 1000} s 未完成繪畫, 請稍後再試! MidjourneyService`
      );
      result.status = 4;
      onFailure(result);
      throw new HttpException('繪畫超時，請稍後再試！', HttpStatus.BAD_REQUEST);
    } catch (error) {
      Logger.error(`繪畫失敗: ${error} MidjourneyService`);
      result.status = 5;
      onFailure(result);
    }
  }
}
