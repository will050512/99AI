import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ChatLogService } from '../chatLog/chatLog.service';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UploadService } from '../upload/upload.service';
// 引入其他需要的模塊或服務

@Injectable()
export class LumaVideoService {
  constructor(
    private readonly chatLogService: ChatLogService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly uploadService: UploadService
  ) {}

  async lumaVideo(inputs) {
    const {
      apiKey,
      proxyUrl,
      fileInfo,
      prompt,
      timeout,
      assistantLogId,
      extraParam,
    } = inputs;
    let result: any = {
      text: '',
      fileInfo: '',
      taskId: '',
      taskData: '',
      status: 2,
    };

    /* 遞交繪畫任務 */
    let response: AxiosResponse<any, any> | null = null;
    let url = '';
    let payloadJson = {};
    const headers = { Authorization: `Bearer ${apiKey}` };

    url = `${proxyUrl}/luma/generations/`;
    const aspectRatio = extraParam.size || '16:9';
    payloadJson = {
      user_prompt: prompt,
      aspect_ratio: aspectRatio,
      expand_prompt: true,
    };

    // 如果 fileInfo 存在，則添加 image_url 屬性
    if (fileInfo) {
      payloadJson['image_url'] = fileInfo;
    }

    Logger.log(
      `正在準備發送請求到 ${url}，payload: ${JSON.stringify(
        payloadJson
      )}, headers: ${JSON.stringify(headers)}`,
      'LumaService'
    );

    try {
      response = await axios.post(url, payloadJson, { headers });
      // Logger.debug(
      //   `任務遞交結果，狀態碼: ${response.status}, 狀態消息: ${
      //     response.statusText
      //   }, 數據: ${JSON.stringify(response.data)}`
      // );
    } catch (error) {
      Logger.error(`任務遞交失敗: ${error.message}`, 'LumaService');
      throw new Error('任務遞交失敗');
    }

    if (response?.data?.id) {
      result.taskId = response?.data?.id;
      Logger.log(`任務遞交成功, 任務ID: ${response?.data?.id}`, 'LumaService');
    } else {
      throw new Error('未能獲取結果數據, 即將重試');
    }

    try {
      await this.pollLumaVideoResult({
        proxyUrl,
        apiKey,
        taskId: response.data.id,
        timeout,
        prompt,
        onSuccess: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              videoUrl: data?.videoUrl,
              audioUrl: data?.audioUrl,
              fileInfo: data?.fileInfo,
              answer: data?.answer || prompt,
              progress: '100%',
              status: 3,
              taskId: data?.taskId,
              taskData: data?.taskData,
            });
            Logger.log('視頻任務已完成', 'LumaService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'LumaService');
          }
        },
        onGenerating: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              videoUrl: data?.videoUrl,
              audioUrl: data?.audioUrl,
              fileInfo: data?.fileInfo,
              answer: data?.answer || '視頻生成中...',
              progress: data?.progress,
              status: data.status,
            });
            Logger.log('視頻生成中...', 'LumaService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'LumaService');
          }
        },
        onFailure: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              answer: '視頻生成失敗',
              status: data.status,
            });
            Logger.log('生成失敗', 'Lum aService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'LumaService');
          }
        },
      });
    } catch (error) {
      Logger.error('查詢生成結果時發生錯誤:', error.message, 'LumaService');
      throw new Error('查詢生成結果時發生錯誤');
    }
    return result;
  }

  async pollLumaVideoResult(inputs) {
    const {
      proxyUrl,
      apiKey,
      taskId,
      timeout,
      onSuccess,
      onFailure,
      onGenerating,
      action,
    } = inputs;

    let result: any = {
      videoUrl: '',
      audioUrl: '',
      fileInfo: '',
      drawId: '',
      taskData: '',
      status: 2,
      progress: 0,
      answer: '',
    };

    const headers = { Authorization: `Bearer ${apiKey}` };
    const url = `${proxyUrl}/luma/generations/${taskId}`;
    const startTime = Date.now();
    const totalDuration = 300000;
    const POLL_INTERVAL = 5000; // 每5秒查一次
    let retryCount = 0; // 當前重試次數

    try {
      while (Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        try {
          // Logger.debug(url, 'LumaService');
          const res = await axios.get(url, { headers });

          const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            let percentage = Math.floor((elapsed / totalDuration) * 100);
            if (percentage >= 99) percentage = 99; // 最多顯示99%
            result.answer = `視頻生成中 （${percentage}%）`;
            // onGenerate(result);
          }, 1000); // 每秒更新一次進度

          const responses = res.data;

          Logger.debug(`輪詢結果: ${JSON.stringify(responses)}`, 'LumaService');

          if (responses.state === 'completed') {
            result.taskId = responses.id;
            result.taskData = JSON.stringify(responses);
            result.fileInfo = responses.video.url;

            try {
              const localStorageStatus =
                await this.globalConfigService.getConfigs([
                  'localStorageStatus',
                ]);
              if (Number(localStorageStatus)) {
                // 使用 Date 對象獲取當前日期並格式化為 YYYYMM/DD
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始，所以+1
                const day = String(now.getDate()).padStart(2, '0');
                const currentDate = `${year}${month}/${day}`;
                result.fileInfo = await this.uploadService.uploadFileFromUrl({
                  url: responses.video.download_url,
                  dir: `video/luma/${currentDate}`,
                });
              }
            } catch (error) {
              Logger.error(`上傳文件失敗: ${error.message}`, 'LumaService');
            }

            result.answer = `提示詞: "${responses.prompt}"`;
            onSuccess(result);
            clearInterval(interval);
            return;
          } else {
            onGenerating(result);
          }

          if (result.progress) {
          }
        } catch (error) {
          retryCount++;
          Logger.error(`輪詢失敗，重試次數: ${retryCount}`, 'LumaService');
        }
      }
      Logger.error('輪詢超時，請稍後再試！', 'LumaService');
      result.status = 4;
      onFailure(result);
      throw new Error('查詢超時，請稍後再試！');
    } catch (error) {
      Logger.error(`輪詢過程中發生錯誤: ${error}`, 'LumaService');
      result.status = 5;
      onFailure(result);
    }
  }

  // async lumaVideo(inputs) {
  //   Logger.log('開始生成視頻', 'LumaVideo');
  //   const {
  //     onGenerate,
  //     onFailure,
  //     onSuccess,
  //     apiKey,
  //     model,
  //     proxyUrl,
  //     timeout,
  //     prompt,
  //   } = inputs;
  //   let result = { answer: '', fileInfo: '', errMsg: '' };
  //   let fullText = ''; // 用於累積content內容
  //   const totalDuration = 180000;
  //   const startTime = Date.now(); // 記錄開始時間

  //   const options: AxiosRequestConfig = {
  //     method: 'POST',
  //     url: `${proxyUrl}/v1/chat/completions`,
  //     responseType: 'stream',
  //     timeout: timeout,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${apiKey}`,
  //     },
  //     data: {
  //       stream: true,
  //       model,
  //       messages: [
  //         {
  //           role: 'user',
  //           content: prompt,
  //         },
  //       ],
  //     },
  //   };

  //   try {
  //     Logger.debug('請求參數', JSON.stringify(options, null, 2)); // 格式化並打印JSON請求參數
  //     const response = await axios(options);
  //     const stream = response.data;

  //     const interval = setInterval(() => {
  //       const elapsed = Date.now() - startTime;
  //       let percentage = Math.floor((elapsed / totalDuration) * 100);
  //       if (percentage >= 99) percentage = 99; // 最多顯示99%
  //       result.answer = `視頻生成中 （${percentage}%）`;
  //       onGenerate(result);
  //     }, 1000); // 每秒更新一次進度

  //     await new Promise((resolve, reject) => {
  //       stream.on('data', (chunk) => {
  //         Logger.log('生成進度: ', fullText);
  //         const splitArr = chunk
  //           .toString()
  //           .split('\n\n')
  //           .filter((line) => line.trim());

  //         splitArr.forEach((line) => {
  //           try {
  //             if (line.trim() === 'data: [DONE]') {
  //               return;
  //             }

  //             // 提取視頻鏈接
  //             const videoLinkMatch = line.match(
  //               /\[在線播放▶️\]\((https?:\/\/[^\)]+\.mp4)\)/
  //             );
  //             if (videoLinkMatch) {
  //               clearInterval(interval); // 視頻生成完成時清除定時器
  //               result.fileInfo = videoLinkMatch[1]; // 確保賦值給正確的屬性
  //               const userPromptMatch = fullText.match(
  //                 /"user_prompt":\s*"(.*?)"/
  //               );
  //               if (userPromptMatch) {
  //                 result.answer = `提示詞: "${userPromptMatch[1]}"`;
  //               } else {
  //                 result.answer = '無法提取提示詞';
  //               }
  //               onSuccess(result);
  //               return;
  //             }

  //             const jsonLine = JSON.parse(line.replace(/^data: /, '').trim());
  //             const content = jsonLine.choices[0]?.delta?.content || '';
  //             fullText += content; // 累積到fullText中

  //             // 根據fullText更新result.text
  //             if (!fullText.includes('user_prompt')) {
  //               if (fullText.includes('生成中..')) {
  //                 result.answer = '視頻生成中';
  //                 onGenerate(result);
  //               } else if (fullText.includes('排隊中.')) {
  //                 result.answer = '排隊中';
  //                 onGenerate(result);
  //               } else {
  //                 result.answer = '遞交成功，視頻生成中';
  //                 onGenerate(result);
  //               }
  //             }
  //           } catch (error) {
  //             console.error('Parse error', error, line);
  //           }
  //         });
  //       });

  //       stream.on('end', () => {
  //         clearInterval(interval); // 流結束時清除定時器
  //         Logger.log('Stream ended'); // 日誌：流結束
  //         resolve(result); // 注意：這裡仍然需要等待流式處理完全完成才能解決Promise
  //       });

  //       stream.on('error', (error) => {
  //         clearInterval(interval); // 出現錯誤時清除定時器
  //         Logger.error('Stream error:', error); // 日誌：流錯誤
  //         reject(error);
  //       });
  //     });
  //     return result;
  //   } catch (error) {
  //     result.errMsg = await handleError(error);
  //     Logger.error(result.errMsg);
  //     onFailure(result);
  //     return;
  //   }
  // }
}
