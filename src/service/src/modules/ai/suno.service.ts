import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ChatLogService } from '../chatLog/chatLog.service';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { UploadService } from '../upload/upload.service';
// 引入其他需要的模塊或服務

@Injectable()
export class SunoService {
  constructor(
    private readonly chatLogService: ChatLogService,
    private readonly uploadService: UploadService,
    private readonly globalConfigService: GlobalConfigService
  ) {}
  async suno(inputs) {
    const {
      apiKey,
      proxyUrl,
      action,
      prompt,
      timeout,
      assistantLogId,
      taskData,
      extraParam,
    } = inputs;
    Logger.debug(`SunoService: ${JSON.stringify(inputs)}`, 'SunoService');
    // return;
    let result: any = {
      text: '',
      fileInfo: '',
      taskId: '',
      taskData: '',
      status: 2,
    };
    Logger.log('開始生成音樂', 'SunoService');

    /* 遞交繪畫任務 */
    let response: AxiosResponse<any, any> | null = null;
    let url = '';
    let payloadJson = {};
    const headers = { Authorization: `Bearer ${apiKey}` };

    if (action === 'LYRICS') {
      url = `${proxyUrl}/task/suno/v1/submit/lyrics`;
      payloadJson = { prompt: prompt };
    }

    if (action === 'MUSIC') {
      url = `${proxyUrl}/task/suno/v1/submit/music`;
      try {
        payloadJson = JSON.parse(taskData);
      } catch (error) {
        Logger.error(`解析taskData失敗: ${error.message}`, 'SunoService');
        throw new Error('taskData格式錯誤');
      }
    }

    Logger.log(
      `正在準備發送請求到 ${url}，payload: ${JSON.stringify(
        payloadJson
      )}, headers: ${JSON.stringify(headers)}`,
      'SunoService'
    );

    try {
      response = await axios.post(url, payloadJson, { headers });
      Logger.debug(
        `任務遞交結果，狀態碼: ${response.status}, 狀態消息: ${
          response.statusText
        }, 數據: ${JSON.stringify(response.data)}`
      );
    } catch (error) {
      Logger.error(`任務遞交失敗: ${error.message}`, 'SunoService');
      throw new Error('任務遞交失敗');
    }

    if (response?.data?.data) {
      result.taskId = response?.data?.data;
      Logger.log(
        `任務遞交成功, 任務ID: ${response?.data?.data}`,
        'SunoService'
      );
    } else {
      throw new Error('未能獲取結果數據, 即將重試');
    }

    try {
      await this.pollSunoMusicResult({
        proxyUrl,
        apiKey,
        taskId: response.data.data,
        timeout,
        prompt,
        action,
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
            Logger.log('音樂任務已完成', 'SunoService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'SunoService');
          }
        },
        onAudioSuccess: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              videoUrl: data?.videoUrl,
              audioUrl: data?.audioUrl,
              fileInfo: data?.fileInfo,
              answer: data?.answer || prompt,
              progress: data?.progress,
              status: data.status,
              taskId: data?.taskId,
              taskData: data?.taskData,
            });
            Logger.log('音頻生成成功，等待視頻生成...', 'SunoService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'SunoService');
          }
        },
        onGenerating: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              videoUrl: data?.videoUrl,
              audioUrl: data?.audioUrl,
              fileInfo: data?.fileInfo,
              answer: data?.answer || '音樂生成中...',
              progress: data?.progress,
              status: data.status,
            });
            Logger.log('音樂生成中...', 'SunoService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'SunoService');
          }
        },
        onFailure: async (data) => {
          try {
            await this.chatLogService.updateChatLog(assistantLogId, {
              answer: '音樂生成失敗',
              status: data.status,
            });
            Logger.log('生成失敗', 'SunoService');
          } catch (error) {
            Logger.error(`更新日誌失敗: ${error.message}`, 'SunoService');
          }
        },
      });
    } catch (error) {
      Logger.error('查詢生成結果時發生錯誤:', error.message, 'SunoService');
      throw new Error('查詢生成結果時發生錯誤');
    }
    return result;
  }

  async pollSunoMusicResult(inputs) {
    const {
      proxyUrl,
      apiKey,
      taskId,
      timeout,
      onSuccess,
      onAudioSuccess,
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
    const url = `${proxyUrl}/task/suno/v1/fetch/${taskId}`;
    const startTime = Date.now();
    const POLL_INTERVAL = 5000; // 每5秒查一次
    let retryCount = 0; // 當前重試次數
    try {
      while (Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        try {
          // Logger.debug(url, 'SunoService');
          const res = await axios.get(url, { headers });

          const responses = res.data.data;

          Logger.debug(`輪詢結果: ${JSON.stringify(responses)}`, 'SunoService');

          if (action === 'LYRICS') {
            if (responses.status === 'SUCCESS') {
              result.taskId = responses.data.id;
              result.taskData = JSON.stringify(responses.data);
              result.answer = responses.data.text;
              onSuccess(result);
              return;
            }
            result.progress = responses?.progress;
            result.answer = `歌詞生成中`;
            if (result.progress) {
              onGenerating(result);
            }
          }
          if (action === 'MUSIC') {
            if (responses.data) {
              const data = responses.data;
              result.taskData = JSON.stringify(data);
              if (Array.isArray(data)) {
                const validAudioUrls = data
                  .map((item) => item.audio_url)
                  .filter((url) => url);

                const validVideoUrls = data
                  .map((item) => item.video_url)
                  .filter((url) => url);

                const validImageUrls = data
                  .map((item) => item.image_url)
                  .filter((url) => url);

                const titles = data.map((item) => item.title);
                const firstTitle = titles.length > 0 ? titles[0] : '音樂已生成';

                if (responses.status === 'SUCCESS') {
                  let audioUrls = [];
                  let videoUrls = [];
                  let imageUrls = [];

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

                      // 上傳音頻文件
                      for (const url of validAudioUrls) {
                        try {
                          const uploadedUrl =
                            await this.uploadService.uploadFileFromUrl({
                              url: url,
                              dir: `audio/suno-music/${currentDate}`,
                            });
                          audioUrls.push(uploadedUrl);
                        } catch (error) {
                          Logger.error(
                            `上傳音頻文件失敗: ${error.message}`,
                            'SunoService'
                          );
                          audioUrls.push(url); // 保持原始 URL
                        }
                      }

                      // 上傳視頻文件
                      for (const url of validVideoUrls) {
                        try {
                          const uploadedUrl =
                            await this.uploadService.uploadFileFromUrl({
                              url: url,
                              dir: `video/suno-music/${currentDate}`,
                            });
                          videoUrls.push(uploadedUrl);
                        } catch (error) {
                          Logger.error(
                            `上傳視頻文件失敗: ${error.message}`,
                            'SunoService'
                          );
                          videoUrls.push(url); // 保持原始 URL
                        }
                      }

                      // 上傳圖片文件
                      for (const url of validImageUrls) {
                        try {
                          const uploadedUrl =
                            await this.uploadService.uploadFileFromUrl({
                              url: url,
                              dir: `images/suno-music/${currentDate}`,
                            });
                          imageUrls.push(uploadedUrl);
                        } catch (error) {
                          Logger.error(
                            `上傳圖片文件失敗: ${error.message}`,
                            'SunoService'
                          );
                          imageUrls.push(url); // 保持原始 URL
                        }
                      }
                    } else {
                      // 保持原始 URL
                      audioUrls = validAudioUrls;
                      videoUrls = validVideoUrls;
                      imageUrls = validImageUrls;
                    }
                  } catch (error) {
                    Logger.error(
                      `獲取配置失敗: ${error.message}`,
                      'LumaService'
                    );
                    // 保持原始 URL
                    audioUrls = validAudioUrls;
                    videoUrls = validVideoUrls;
                    imageUrls = validImageUrls;
                  }

                  result.audioUrl = audioUrls.join(',');
                  result.videoUrl = videoUrls.join(',');
                  result.fileInfo = imageUrls.join(',');

                  if (validAudioUrls.length === 2) {
                    result.status = 3;
                    result.answer = firstTitle;
                  } else {
                    result.status = 2;
                    result.progress = responses?.progress;
                    result.answer = `當前生成進度 ${responses?.progress}`;
                  }

                  Logger.debug(
                    `音樂生成成功: ${JSON.stringify(data)}`,
                    'SunoService'
                  );
                  onSuccess(result);
                  return;
                } else {
                  // 保持原始 URL
                  result.audioUrl = validAudioUrls.join(',');
                  result.videoUrl = validVideoUrls.join(',');
                  result.fileInfo = validImageUrls.join(',');
                  result.status = 2;
                  result.progress = responses?.progress;
                  result.answer = firstTitle;
                  onAudioSuccess(result);
                }
              }
            }

            if (!result.audioUrl && result.progress && result.status === 2) {
              onGenerating(result);
            }
          }
        } catch (error) {
          retryCount++;
          Logger.error(`輪詢失敗，重試次數: ${retryCount}`, 'SunoService');
        }
      }
      Logger.error('輪詢超時，請稍後再試！', 'SunoService');
      result.status = 4;
      onFailure(result);
      throw new Error('查詢超時，請稍後再試！');
    } catch (error) {
      Logger.error(`輪詢過程中發生錯誤: ${error}`, 'SunoService');
      result.status = 5;
      onFailure(result);
    }
  }
}
