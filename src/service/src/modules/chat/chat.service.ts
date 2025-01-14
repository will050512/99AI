import { formatUrl, getClientIp, getTokenCount } from '@/common/utils';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';
import { In, Repository } from 'typeorm';
import { AiPptService } from '../ai/aiPPT';
import { CogVideoService } from '../ai/cogVideo.service';
import { FluxDrawService } from '../ai/fluxDraw.service';
import { LumaVideoService } from '../ai/lumaVideo.service';
import { MidjourneyService } from '../ai/midjourneyDraw.service';
import { OpenAIChatService } from '../ai/openaiChat.service';
import { OpenAIDrawService } from '../ai/openaiDraw.service';
import { StableDiffusionService } from '../ai/stableDiffusion.service';
import { SunoService } from '../ai/suno.service';
import { AppEntity } from '../app/app.entity';
import { AutoreplyService } from '../autoreply/autoreply.service';
import { BadWordsService } from '../badWords/badWords.service';
import { ChatGroupService } from '../chatGroup/chatGroup.service';
import { ChatLogService } from '../chatLog/chatLog.service';
import { ConfigEntity } from '../globalConfig/config.entity';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { ModelsService } from '../models/models.service';
import { PluginEntity } from '../plugin/plugin.entity';
import { UploadService } from '../upload/upload.service';
import { UserService } from '../user/user.service';
import { UserBalanceService } from '../userBalance/userBalance.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configEntity: Repository<ConfigEntity>,
    @InjectRepository(AppEntity)
    private readonly appEntity: Repository<AppEntity>,
    @InjectRepository(PluginEntity)
    private readonly pluginEntity: Repository<PluginEntity>,
    private readonly sunoService: SunoService,
    private readonly openAIChatService: OpenAIChatService,
    private readonly chatLogService: ChatLogService,
    private readonly midjourneyService: MidjourneyService,
    private readonly stableDiffusionService: StableDiffusionService,
    private readonly userBalanceService: UserBalanceService,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
    private readonly badWordsService: BadWordsService,
    private readonly autoreplyService: AutoreplyService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly chatGroupService: ChatGroupService,
    private readonly modelsService: ModelsService,
    private readonly openAIDrawService: OpenAIDrawService,
    private readonly lumaVideoService: LumaVideoService,
    private readonly cogVideoService: CogVideoService,
    private readonly fluxDrawService: FluxDrawService,
    private readonly aiPptService: AiPptService
  ) {}

  /* 有res流回復 沒有同步回覆 */
  async chatProcess(body: any, req?: Request, res?: Response) {
    await this.userBalanceService.checkUserCertification(req.user.id);
    /* 獲取對話參數 */
    const {
      options = {},
      usingPluginId,
      appId = null,
      specialModel,
      prompt,
      fileInfo,
      extraParam,
      model,
      drawId,
      customId,
      action,
      modelName,
      modelAvatar,
    } = body;

    // 獲取應用資訊
    let appInfo;
    if (specialModel) {
      appInfo = await this.appEntity.findOne({
        where: { des: specialModel, isSystemReserved: true },
      });
      // Logger.debug(`appId: ${JSON.stringify(appInfo, null, 2)}`);
    } else if (appId) {
      appInfo = await this.appEntity.findOne({
        where: { id: appId, status: In([1, 3, 4, 5]) },
      });
      // Logger.debug(`appId: ${JSON.stringify(appInfo, null, 2)}`);
      if (!appInfo) {
        throw new HttpException(
          '你當前使用的應用已被下架、請刪除當前對話開啟新的對話吧！',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const { groupId, fileParsing } = options;
    const {
      openaiTimeout,
      openaiBaseUrl,
      openaiBaseKey,
      systemPreMessage,
      isMjTranslate,
      mjTranslatePrompt,
      openaiTemperature,
      openaiBaseModel,
      isGeneratePromptReference,
      isConvertToBase64,
      isSensitiveWordFilter,
    } = await this.globalConfigService.getConfigs([
      'openaiTimeout',
      'openaiBaseUrl',
      'openaiBaseKey',
      'systemPreMessage',
      'isMjTranslate',
      'mjTranslatePrompt',
      'openaiTemperature',
      'openaiBaseModel',
      'isGeneratePromptReference',
      'isConvertToBase64',
      'isSensitiveWordFilter',
    ]);

    /* 檢測用戶狀態 */
    await this.userService.checkUserStatus(req.user);

    /* 敏感詞檢測 */
    res &&
      res.setHeader('Content-type', 'application/octet-stream; charset=utf-8');
    // 檢查敏感詞彙
    if (isSensitiveWordFilter === '1') {
      const triggeredWords = await this.badWordsService.checkBadWords(
        prompt,
        req.user.id
      );
      if (triggeredWords.length > 0) {
        // 如果返回的數組不為空
        const tips = `您遞交的資訊中包含違規的內容，我們已對您的賬戶進行標記，請合規使用！`;
        throw new HttpException(tips, HttpStatus.BAD_REQUEST);
      }
    }

    /* 自動回覆 */
    const autoReplyRes = await this.autoreplyService.checkAutoReply(prompt);
    // Logger.debug(
    //   `自動回覆結果: ${JSON.stringify(autoReplyRes)}`,
    //   'ChatService'
    // );
    // return;

    /* 設置對話變量 */
    let currentRequestModelKey = null;
    let appName = '';
    let setSystemMessage = '';
    res && res.status(200);
    let response = null;
    const curIp = getClientIp(req);
    let usePrompt;
    let useModelAvatar = '';
    let usingPlugin;

    if (usingPluginId) {
      usingPlugin = await this.pluginEntity.findOne({
        where: { id: usingPluginId },
      });
      // Logger.debug(`外掛資訊: ${JSON.stringify(usingPlugin, null, 2)}`);
    }

    /* 獲取模型配置及預設設置 */
    if (appInfo) {
      const { isGPTs, gizmoID, name, isFixedModel, appModel, coverImg } =
        appInfo;
      useModelAvatar = coverImg;
      appName = name;
      if (isGPTs) {
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo('gpts');
        // await this.chatLogService.checkModelLimits(req.user, 'gpts');
        currentRequestModelKey.model = `gpt-4-gizmo-${gizmoID}`;
      } else if (!isGPTs && isFixedModel && appModel) {
        // Logger.debug(appModel)
        appInfo.preset && (setSystemMessage = appInfo.preset);
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo(appModel);
        // await this.chatLogService.checkModelLimits(req.user, appModel);
        currentRequestModelKey.model = appModel;
        if (fileParsing) {
          setSystemMessage = `${setSystemMessage}以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
        }

        Logger.log(
          `固定模型、使用應用預設: ${setSystemMessage}`,
          'ChatService'
        );
      } else {
        // 使用應用預設
        appInfo.preset && (setSystemMessage = appInfo.preset);
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo(model);
        // await this.chatLogService.checkModelLimits(req.user, model);
        if (fileParsing) {
          setSystemMessage = `${setSystemMessage}以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
        }

        Logger.log(`使用應用預設: ${setSystemMessage}`, 'ChatService');
      }
    } else {
      const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);
      if (usingPlugin && usingPlugin.isSystemPlugin === 0) {
        let pluginPrompt = '';
        try {
          pluginPrompt = await this.usePlugin(prompt, usingPlugin.parameters);
          Logger.log(`外掛返回結果: ${pluginPrompt}`, 'ChatService');
        } catch (error) {
          pluginPrompt = prompt; // 或者其他錯誤處理邏輯
          Logger.error(`外掛調用錯誤: ${error}`);
        }
        setSystemMessage = pluginPrompt;
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo(model);
        // await this.chatLogService.checkModelLimits(req.user, model);
        Logger.log(`使用外掛預設: ${setSystemMessage}`, 'ChatService');
      } else if (fileParsing) {
        setSystemMessage = `以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo(model);
        // await this.chatLogService.checkModelLimits(req.user, model);
        Logger.log(`使用文件解析: ${setSystemMessage}`, 'ChatService');
      } else {
        // 使用全局預設
        const currentDate = new Date().toISOString().split('T')[0];
        setSystemMessage = systemPreMessage + `\n Current date: ${currentDate}`;
        currentRequestModelKey =
          await this.modelsService.getCurrentModelKeyInfo(model);

        Logger.log(`使用全局預設: ${setSystemMessage}`, 'ChatService');
      }
    }

    if (!currentRequestModelKey) {
      Logger.debug('未找到當前模型key，切換至全局模型', 'ChatService');
      currentRequestModelKey = await this.modelsService.getCurrentModelKeyInfo(
        openaiBaseModel
      );
      const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);

      // 假設 groupInfo.config 是 JSON 字串，並且你需要替換其中的 modelName 和 model
      let updatedConfig = groupInfo.config;
      try {
        const parsedConfig = JSON.parse(groupInfo.config);
        if (parsedConfig.modelInfo) {
          parsedConfig.modelInfo.modelName = currentRequestModelKey.modelName; // 替換為你需要的模型名稱
          parsedConfig.modelInfo.model = currentRequestModelKey.model; // 替換為你需要的模型
          updatedConfig = JSON.stringify(parsedConfig);
        }
      } catch (error) {
        Logger.debug('模型切換錯誤，請檢查全局模型配置！', 'ChatService');
        throw new HttpException('配置解析錯誤！', HttpStatus.BAD_REQUEST);
      }

      await this.chatGroupService.update(
        {
          groupId,
          title: groupInfo.title,
          isSticky: false,
          config: updatedConfig,
          fileUrl: '',
        },
        req
      );
    }

    const {
      deduct,
      isTokenBased,
      tokenFeeRatio,
      deductType,
      key,
      id: keyId,
      maxRounds,
      proxyUrl,
      maxModelTokens,
      timeout,
      model: useModel,
      isFileUpload,
      keyType: modelType,
    } = currentRequestModelKey;

    if (await this.chatLogService.checkModelLimits(req.user, useModel)) {
      throw new HttpException(
        '1 小時內對話次數過多，請切換模型或稍後再試！',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (
      isMjTranslate === '1' &&
      action === 'IMAGINE' &&
      model === 'midjourney'
    ) {
      // 將 prompt 按 "--" 分割成兩部分
      const [beforeArgs, afterArgs] = prompt.split(/(?= --)/);

      // 使用正則表達式識別並提取鏈接
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      const urls = beforeArgs.match(urlPattern) || [];

      // 提取鏈接後剩餘的部分
      let textToTranslate = beforeArgs.replace(urlPattern, '').trim();

      // 調用翻譯服務翻譯中文部分
      const translatedText = await this.openAIChatService.chatFree(
        textToTranslate,
        mjTranslatePrompt ||
          "Translate any given phrase from any language into English. For instance, when I input '{可愛的熊貓}', you should output '{cute panda}', with no period at the end."
      );

      // 重新拼接鏈接、翻譯後的文本和附加參數
      const finalTranslatedPrompt = [...urls, translatedText].join(' ').trim();
      usePrompt = afterArgs
        ? `${finalTranslatedPrompt}${afterArgs}`
        : finalTranslatedPrompt;

      // 如果是文件上傳，保留 fileInfo 邏輯
      if (isFileUpload === '1' && fileInfo) {
        usePrompt = `${fileInfo} ${usePrompt}`;
      }

      // Logger.debug(`翻譯後的用戶提問: ${translatedText}, 最終使用的提示: ${usePrompt}`);
    } else {
      usePrompt =
        isFileUpload === '1' && fileInfo ? fileInfo + ' ' + prompt : prompt;
      // Logger.debug(`未進行翻譯，最終使用的提示: ${usePrompt}`);
    }

    // 檢測用戶餘額
    await this.userBalanceService.validateBalance(req, deductType, deduct);

    // 整理對話參數
    const useModeName = modelName;
    const proxyResUrl = formatUrl(
      proxyUrl || openaiBaseUrl || 'https://api.openai.com'
    );

    const modelKey = key || openaiBaseKey;
    const modelTimeout = (timeout || openaiTimeout || 300) * 1000;
    const temperature = Number(openaiTemperature) || 1;
    // Logger.log(
    //   `\n` +
    //     `超時設置: ${modelTimeout / 1000} s\n` +
    //     `請求地址: ${proxyResUrl}\n` +
    //     `使用的模型名稱: ${useModeName}\n` +
    //     `使用的模型: ${useModel}`,
    //   'ChatService'
    // );

    if (groupId) {
      const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);
      this.updateChatTitle(groupId, groupInfo, modelType, prompt, req); // Call without await
      await this.chatGroupService.updateTime(groupId);
    }

    const userSaveLog = await this.chatLogService.saveChatLog({
      appId: appId,
      curIp,
      userId: req.user.id,
      type: modelType ? modelType : 1,
      prompt,
      fileInfo: fileInfo ? fileInfo : null,
      answer: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: useModel,
      modelName: '我',
      role: 'user',
      groupId: groupId ? groupId : null,
    });

    const assistantSaveLog = await this.chatLogService.saveChatLog({
      appId: appId ? appId : null,
      action: action ? action : null,
      curIp,
      userId: req.user.id,
      type: modelType ? modelType : 1,
      prompt: prompt,
      fileInfo: null,
      answer: '',
      progress: '0%',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: useModel,
      modelName: useModeName,
      role: 'assistant',
      groupId: groupId ? groupId : null,
      status: 2,
      modelAvatar:
        usingPlugin?.pluginImg || useModelAvatar || modelAvatar || '',
      pluginParam: usingPlugin?.parameters
        ? usingPlugin.parameters
        : modelType === 2
        ? useModel
        : null,
    });
    const userLogId = userSaveLog.id;
    const assistantLogId = assistantSaveLog.id;

    if (autoReplyRes.answer && res) {
      if (autoReplyRes.isAIReplyEnabled === 0) {
        const chars = autoReplyRes.answer.split('');

        // 使用一個遞歸函數來逐個字符發送響應
        const sendCharByChar = (index) => {
          if (index < chars.length) {
            const msg = { text: chars[index] }; // 封裝當前字符為對象
            res.write(`${JSON.stringify(msg)}\n`); // 發送當前字符
            setTimeout(() => sendCharByChar(index + 1), 10); // 設置定時器遞歸調用
          } else {
            res.end(); // 所有字符發送完畢，結束響應
          }
        };

        // 從第一個字符開始發送
        sendCharByChar(0);
        await this.chatLogService.updateChatLog(assistantLogId, {
          answer: autoReplyRes.answer,
        });
        return;
      } else {
        setSystemMessage = setSystemMessage + autoReplyRes.answer;
      }
    }

    // Logger.debug(`當前使用的模型key: ${setSystemMessage}`);
    /* 獲取歷史消息 */
    const { messagesHistory } = await this.buildMessageFromParentMessageId(
      prompt,
      {
        groupId,
        systemMessage: setSystemMessage,
        maxModelTokens,
        maxRounds: maxRounds,
        // usingPlugin?.parameters === 'net-search' ||
        // usingPlugin?.parameters === 'mind-map' ||
        // useModel.includes('suno')
        //   ? 0
        //   : maxRounds,
        isConvertToBase64: isConvertToBase64,
        fileInfo: fileInfo,
        model: useModel,
        isFileUpload,
      },
      this.chatLogService
    );

    /* 單獨處理 MJ 積分的扣費 */
    let charge =
      action !== 'UPSCALE' && useModel === 'midjourney' ? deduct * 4 : deduct;

    const abortController = new AbortController();
    /* 處理對話  */
    try {
      if (res) {
        res.on('close', () => {
          abortController.abort();
        });

        let response;
        // const { key, maxToken, maxTokenRes, proxyResUrl } = await this.formatModelToken(currentRequestModelKey);
        let firstChunk = true;
        try {
          /* 繪畫 */
          if (
            (useModel === 'dall-e-3' ||
              useModel === 'midjourney' ||
              useModel === 'ai-ppt' ||
              useModel === 'suno-music' ||
              useModel === 'luma-video' ||
              useModel.includes('stable-diffusion') ||
              useModel.includes('cog-video') ||
              useModel.includes('flux')) &&
            modelType === 2
          ) {
            if (useModel === 'dall-e-3') {
              response = this.openAIDrawService.dalleDraw(
                {
                  prompt: prompt,
                  extraParam: extraParam,
                  apiKey: modelKey,
                  proxyUrl: proxyResUrl,
                  model: useModel,
                  timeout: modelTimeout,
                  modelName: useModeName,
                  groupId: groupId,
                  onSuccess: async (data) => {
                    // 處理成功獲取繪圖結果的邏輯
                    await this.chatLogService.updateChatLog(assistantLogId, {
                      fileInfo: data?.fileInfo,
                      answer: data?.answer || prompt,
                      progress: '100%',
                      status: data.status,
                    });
                  },
                  onFailure: async (data) => {
                    // 處理失敗邏輯
                    await this.chatLogService.updateChatLog(assistantLogId, {
                      answer: '繪圖失敗',
                      status: data.status,
                    });
                  },
                },
                this.buildMessageFromParentMessageId
              );
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '繪製中',
              });
            } else if (useModel === 'ai-ppt') {
              Logger.log('開始生成PPT', 'DrawService');
              response = this.aiPptService.aiPPT({
                usePrompt: usePrompt,
                prompt: prompt,
                apiKey: modelKey,
                proxyUrl: proxyResUrl,
                model: useModel,
                modelName: useModeName,
                drawId,
                customId,
                action,
                timeout: modelTimeout,
                assistantLogId,
                extraParam,
                fileInfo,
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '生成中',
              });
            } else if (useModel.includes('flux')) {
              response = this.fluxDrawService.fluxDraw(
                {
                  prompt: prompt,
                  extraParam: extraParam,
                  apiKey: modelKey,
                  proxyUrl: proxyResUrl,
                  model: useModel,
                  timeout: modelTimeout,
                  modelName: useModeName,
                  groupId: groupId,
                  onSuccess: async (data) => {
                    // 處理成功獲取繪圖結果的邏輯
                    await this.chatLogService.updateChatLog(assistantLogId, {
                      fileInfo: data?.fileInfo,
                      answer: data?.answer || prompt,
                      progress: '100%',
                      status: data.status,
                    });
                  },
                  onFailure: async (data) => {
                    // 處理失敗邏輯
                    await this.chatLogService.updateChatLog(assistantLogId, {
                      answer: '繪圖失敗',
                      status: data.status,
                    });
                  },
                },
                this.buildMessageFromParentMessageId
              );
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '繪製中',
              });
            } else if (useModel.includes('suno-music')) {
              response = this.sunoService.suno({
                assistantLogId,
                apiKey: modelKey,
                action,
                prompt,
                timeout: modelTimeout,
                proxyUrl: proxyResUrl,
                taskData: customId,
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '遞交成功，歌曲生成中',
              });
            } else if (useModel.includes('luma-video')) {
              // Logger.debug('luma-video');
              response = this.lumaVideoService.lumaVideo({
                fileInfo,
                extraParam,
                assistantLogId,
                apiKey: modelKey,
                action,
                prompt,
                model: useModel,
                timeout: modelTimeout,
                proxyUrl: proxyResUrl,
                taskData: customId,
                onGenerate: async (data) => {
                  // 處理成功獲取繪圖結果的邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    fileInfo: data?.fileInfo,
                    answer: data?.answer || prompt,
                    // progress: '100%',
                    status: 2,
                  });
                },
                onSuccess: async (data) => {
                  // 處理成功獲取繪圖結果的邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    fileInfo: data?.fileInfo,
                    answer: data?.answer || prompt,
                    progress: '100%',
                    status: 3,
                  });
                },
                onFailure: async (data) => {
                  // 處理失敗邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    answer: data.errMsg,
                    status: 4,
                  });
                },
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '遞交成功，視頻生成中',
              });
            } else if (useModel.includes('cog-video')) {
              // Logger.debug('luma-video');
              response = this.cogVideoService.cogVideo({
                fileInfo,
                extraParam,
                assistantLogId,
                apiKey: modelKey,
                action,
                prompt,
                model: useModel,
                timeout: modelTimeout,
                proxyUrl: proxyResUrl,
                taskData: customId,
                onGenerate: async (data) => {
                  // 處理成功獲取繪圖結果的邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    fileInfo: data?.fileInfo,
                    answer: data?.answer || prompt,
                    // progress: '100%',
                    status: 2,
                  });
                },
                onSuccess: async (data) => {
                  // 處理成功獲取繪圖結果的邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    fileInfo: data?.fileInfo,
                    answer: data?.answer || prompt,
                    progress: '100%',
                    status: 3,
                  });
                },
                onFailure: async (data) => {
                  // 處理失敗邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    answer: data.errMsg,
                    status: 4,
                  });
                },
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '遞交成功，視頻生成中',
              });
            } else if (useModel.includes('stable-diffusion')) {
              response = this.stableDiffusionService.sdxl({
                chatId: assistantLogId,
                maxModelTokens,
                apiKey: modelKey,
                model: useModel,
                modelName: useModeName,
                modelType,
                prompt,
                fileInfo,
                isFileUpload,
                timeout: modelTimeout,
                proxyUrl: proxyResUrl,
                onSuccess: async (data) => {
                  // 處理成功獲取繪圖結果的邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    fileInfo: data?.fileInfo,
                    answer: data?.answer || prompt,
                    progress: '100%',
                    status: 3,
                  });
                },
                onFailure: async (data) => {
                  // 處理失敗邏輯
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    answer: '生成失敗',
                    status: 4,
                  });
                },
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: '繪製中',
              });
            } else {
              response = await this.midjourneyService.midjourneyDraw({
                usePrompt: usePrompt,
                prompt: prompt,
                apiKey: modelKey,
                proxyUrl: proxyResUrl,
                model: useModel,
                modelName: useModeName,
                drawId,
                customId,
                action,
                fileInfo,
                timeout: modelTimeout,
                assistantLogId,
              });
              await this.chatLogService.updateChatLog(assistantLogId, {
                answer: response.answer,
                status: response.status,
              });
            }

            //執行扣費
            if (response.status !== 5) {
              await this.modelsService.saveUseLog(keyId, 1);
              await this.userBalanceService.deductFromBalance(
                req.user.id,
                deductType,
                charge
              );
            } else {
              Logger.log('任務遞交失敗，不執行扣費', 'ChatService');
            }

            //查詢用戶現在的餘額
            const userBalance = await this.userBalanceService.queryUserBalance(
              req.user.id
            );
            response.userBalance = { ...userBalance };
            response.text = response.answer;
            response.status = response.status || 2;
            response.model = model;
            response.modelName = modelName;

            return res.write(`\n${JSON.stringify(response)}`);

            /* 記錄key的使用次數 和使用token */
          } else {
            /* 普通對話 */
            response = await this.openAIChatService.openAIChat(
              messagesHistory,
              {
                chatId: assistantLogId,
                maxModelTokens,
                apiKey: modelKey,
                model: useModel,
                modelName: useModeName,
                temperature,
                modelType,
                prompt,
                fileInfo,
                isFileUpload,
                timeout: modelTimeout,
                proxyUrl: proxyResUrl,
                modelAvatar: modelAvatar,
                onProgress: (chat) => {
                  res.write(
                    firstChunk
                      ? JSON.stringify(chat)
                      : `\n${JSON.stringify(chat)}`
                  );
                  firstChunk = false;
                },
                onFailure: async (data) => {
                  await this.chatLogService.updateChatLog(assistantLogId, {
                    answer: data.errMsg,
                    status: 4,
                  });
                },
                abortController,
              }
            );

            if (response.errMsg) {
              Logger.error(
                `用戶ID: ${req.user.id} 模型名稱: ${useModeName} 模型: ${model} 回覆出錯，本次不扣除積分`,
                'ChatService'
              );
              return res.write(`\n${JSON.stringify(response)}`);
            }

            let totalText = '';
            messagesHistory.forEach((messagesHistory) => {
              totalText += messagesHistory.content + ' ';
            });
            const promptTokens = await getTokenCount(totalText);
            const completionTokens = await getTokenCount(response.answer);
            await this.chatLogService.updateChatLog(userLogId, {
              promptTokens: promptTokens,
              completionTokens: completionTokens,
              totalTokens: promptTokens + completionTokens,
            });

            let sanitizedAnswer = response.answer;
            if (isSensitiveWordFilter === '1') {
              const triggeredWords = await this.badWordsService.checkBadWords(
                response.answer,
                req.user.id
              );

              if (triggeredWords.length > 0) {
                // 構造一個正則表達式來匹配所有敏感詞
                const regex = new RegExp(triggeredWords.join('|'), 'gi'); // 忽略大小寫替換

                // 使用回調函數替換敏感詞，每個敏感詞替換為相應長度的 *
                sanitizedAnswer = sanitizedAnswer.replace(regex, (matched) =>
                  '*'.repeat(matched.length)
                );
              }
            }

            // 如果檢測到敏感詞，替換為 ***
            // gpt回答 - 使用替換後的內容存入數據庫
            await this.chatLogService.updateChatLog(assistantLogId, {
              fileInfo: response?.fileInfo,
              answer: sanitizedAnswer, // 使用替換後的內容
              promptTokens: promptTokens,
              completionTokens: completionTokens,
              totalTokens: promptTokens + completionTokens,
              status: 3,
            });

            try {
              if (isGeneratePromptReference === '1') {
                const promptReference = await this.openAIChatService.chatFree(
                  `根據用戶提問{${prompt}}以及 AI 的回答{${response.answer}}，生成三個更進入一步的提問，用{}包裹每個問題，不需要分行，不需要其他任何內容，單個提問不超過30個字`
                );
                await this.chatLogService.updateChatLog(assistantLogId, {
                  promptReference: promptReference,
                });
              }
            } catch (error) {
              Logger.error(`調用 chatFree 出錯: ${error}`);
            }

            if (isTokenBased === true) {
              charge =
                deduct *
                Math.ceil((promptTokens + completionTokens) / tokenFeeRatio);
            }

            await this.userBalanceService.deductFromBalance(
              req.user.id,
              deductType,
              charge,
              promptTokens + completionTokens
            );
            /* 記錄key的使用次數 和使用token */
            await this.modelsService.saveUseLog(
              keyId,
              promptTokens + completionTokens
            );

            Logger.log(
              `用戶ID: ${
                req.user.id
              } 模型名稱: ${useModeName} 模型: ${model} 消耗token: ${
                promptTokens + completionTokens
              }, 消耗積分： ${charge}`,
              'ChatService'
            );
            const userBalance = await this.userBalanceService.queryUserBalance(
              req.user.id
            );
            response.userBalance = { ...userBalance };
            return res.write(`\n${JSON.stringify(response)}`);
          }
        } catch (error) {
          // 在這裡處理錯誤，例如打印錯誤消息到控制檯或向用戶發送錯誤響應
          Logger.error('發生錯誤:', error);
          // 根據你的應用需求，你可能想要在這裡設置response為一個錯誤消息或執行其他錯誤處理邏輯
          await this.chatLogService.updateChatLog(assistantLogId, {
            status: 5,
          });
          response = { error: '處理請求時發生錯誤' };
        }
      } else {
        response = await this.openAIChatService.openAIChat(messagesHistory, {
          chatId: assistantLogId,
          maxModelTokens,
          apiKey: modelKey,
          model: useModel,
          modelName: useModeName,
          modelType,
          temperature,
          prompt,
          fileInfo,
          isFileUpload,
          timeout: modelTimeout,
          proxyUrl: proxyResUrl,
          abortController,
        });
        await this.userBalanceService.deductFromBalance(
          req.user.id,
          deductType,
          charge
        );
        return response.answer;
      }
    } catch (error) {
      Logger.error(
        'chat-error <----------------------------------------->',
        modelKey,
        error
      );
      if (res) {
        return res.write('發生未知錯誤，請稍後再試');
      } else {
        throw new HttpException(
          '發生未知錯誤，請稍後再試',
          HttpStatus.BAD_REQUEST
        );
      }
    } finally {
      res && res.end();
    }
  }

  async usePlugin(prompt: string, pluginParam: string) {
    const { pluginUrl, pluginKey } = await this.globalConfigService.getConfigs([
      'pluginUrl',
      'pluginKey',
    ]);
    const key = pluginKey;
    const proxyUrl = pluginUrl;

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${proxyUrl}/plugins/${pluginParam}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      data: {
        prompt: prompt,
      },
    };

    try {
      const response: any = await axios(options);
      Logger.log(
        `外掛調用成功 返回結果: ${JSON.stringify(response.data, null, 2)}`,
        'PluginService'
      );
      return response.data.text;
    } catch (error) {
      Logger.error('error: ', error);
    }
  }

  async updateChatTitle(groupId, groupInfo, modelType, prompt, req) {
    if (groupInfo?.title === '新對話') {
      // '新對話' can be replaced with 'New chat' if needed
      let chatTitle: string;
      if (modelType === 1) {
        try {
          chatTitle = await this.openAIChatService.chatFree(
            `根據用戶提問{${prompt}}，給這個對話取一個名字，不超過10個字`
          );
          if (chatTitle.length > 15) {
            chatTitle = chatTitle.slice(0, 15);
          }
        } catch (error) {
          Logger.error(`調用 chatFree 出錯: ${error}`);
          chatTitle = prompt.slice(0, 10);
        }
      } else {
        chatTitle = '創意 AI';
      }

      this.chatGroupService
        .update(
          {
            groupId,
            title: chatTitle,
            isSticky: false,
            config: '',
            fileUrl: '',
          },
          req
        )
        .then(() => Logger.log(`更新標題名稱為: ${chatTitle}`, 'ChatService'))
        .catch((error) => Logger.error(`更新對話組標題失敗: ${error}`));
    }
  }

  async buildMessageFromParentMessageId(
    text: string,
    options: any,
    chatLogService
  ) {
    let {
      systemMessage = '',
      fileInfo,
      groupId,
      maxRounds = 5,
      maxModelTokens = 8000,
      isFileUpload = 0,
      isConvertToBase64, // 新增選項，是否轉換為Base64
    } = options;

    // 確保 systemMessage 不超過 maxModelTokens
    if (systemMessage.length > maxModelTokens) {
      Logger.log('系統消息超過最大長度，將被截斷', 'ChatService');
      systemMessage = systemMessage.slice(0, maxModelTokens);
    }

    let messages = [];
    // 添加系統消息（如果有）
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }

    // 查詢歷史對話列表
    if (groupId) {
      const history = await chatLogService.chatHistory(groupId, maxRounds);
      let tempUserMessage = null; // 用於暫存user消息，確保和assistant消息成對出現

      // 使用 for...of 結合 async/await，確保等待每個異步操作完成
      for (const record of history) {
        try {
          let content;

          if (
            (isFileUpload === 2 || isFileUpload === 3) &&
            record.fileInfo &&
            record.role === 'user'
          ) {
            // 特殊處理gpt-4-vision-preview模型
            const imageUrls = await Promise.all(
              record.fileInfo.split(',').map(async (url) => ({
                type: 'image_url',
                image_url: {
                  url:
                    isConvertToBase64 === '1'
                      ? await this.convertUrlToBase64(url.trim())
                      : url.trim(),
                },
              }))
            );
            content = [{ type: 'text', text: record.text }, ...imageUrls];
          } else if (
            isFileUpload === 1 &&
            record.fileInfo &&
            record.role === 'user'
          ) {
            // 特殊處理gpt-4-all模型
            // const urls = await Promise.all(
            //   record.fileInfo.split(',').map(async (url) => url.trim())
            // );
            // content = urls.join('\n') + '\n' + record.text;

            content = record.fileInfo + '\n' + record.text;
          } else {
            // 默認處理
            content = record.text;
          }

          // 確保user和assistant消息成對且不為空
          if (record.role === 'user') {
            tempUserMessage = { role: record.role, content }; // 暫存user消息
          } else if (record.role === 'assistant') {
            // 確保 content 是字串
            const contentStr = Array.isArray(content)
              ? JSON.stringify(content)
              : content;
            if (tempUserMessage && contentStr.trim() !== '') {
              messages.push(tempUserMessage); // 添加之前暫存的user消息
              messages.push({ role: record.role, content }); // 添加assistant消息
              tempUserMessage = null; // 重置暫存的user消息
            }
          }
        } catch (error) {
          Logger.error(
            '處理歷史記錄時出錯:',
            error,
            '記錄:',
            JSON.stringify(record, null, 2)
          );
        }
      }
    }

    // 添加當前用戶消息
    let currentMessageContent;
    if ((isFileUpload === 2 || isFileUpload === 3) && fileInfo) {
      // 處理 fileInfo 為單個文件或多個文件的情況
      const imageUrls = await Promise.all(
        fileInfo.split(',').map(async (url) => ({
          type: 'image_url',
          image_url: {
            url:
              isConvertToBase64 === '1'
                ? await this.convertUrlToBase64(url.trim())
                : url.trim(),
          },
        }))
      );
      currentMessageContent = [{ type: 'text', text }, ...imageUrls];
    } else if (isFileUpload === 1 && fileInfo) {
      // const urls = await Promise.all(
      //   fileInfo.split(',').map(async (url) => url.trim())
      // );
      // currentMessageContent = urls.join('\n') + '\n' + text;
      currentMessageContent = fileInfo + '\n' + text;
    } else {
      currentMessageContent = text;
    }
    messages.push({ role: 'user', content: currentMessageContent });

    let totalTokens = await getTokenCount(messages);

    // 限制消息
    let tokenLimit: number;
    if (maxModelTokens < 8000) {
      tokenLimit = 4000;
    } else {
      tokenLimit = maxModelTokens - 4000;
    }

    while (totalTokens > tokenLimit) {
      // 檢查是否只剩下一條system消息和一條user消息
      if (
        messages.length === 2 &&
        messages[0].role === 'system' &&
        messages[1].role === 'user'
      ) {
        // 如果是，那麼不再嘗試刪除消息，直接跳出循環
        break;
      }

      let foundPairToDelete = false;
      for (let i = 0; i < messages.length; i++) {
        if (
          messages[i].role !== 'system' &&
          messages[i + 1] &&
          messages[i + 1].role === 'assistant'
        ) {
          // 從前往後逐對刪除非系統消息，確保成對刪除
          messages.splice(i, 2);
          foundPairToDelete = true;
          break;
        }
      }

      // 如果沒有找到可以刪除的成對消息，則嘗試刪除單個user消息（如果存在）
      if (!foundPairToDelete) {
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].role === 'user') {
            messages.splice(i, 1);
            break;
          }
        }
      }

      totalTokens = await getTokenCount(messages); // 重新計算總token數
      // 再次檢查是否只剩下一條system消息和一條user消息
      if (messages.length <= 2) {
        break; // 如果是，提前跳出循環
      }
    }
    return {
      messagesHistory: messages,
      round: messages.length,
    };
  }

  // 新增：轉換URL到Base64的輔助函數
  async convertUrlToBase64(url: string): Promise<string> {
    try {
      console.log(`正在嘗試轉換URL為Base64: ${url}`);

      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary'); // 獲取圖片的二進制數據

      console.log(`成功獲取圖片，正在轉換為Base64: ${url}`);

      const base64Data = `data:${
        response.headers['content-type']
      };base64,${buffer.toString('base64')}`;
      console.log(`成功轉換URL為Base64: ${url}`);
      return base64Data;
    } catch (error) {
      console.error('轉換URL為Base64時發生錯誤:', error);
      console.warn(`返回原始鏈接: ${url}`);
      return url; // 返回原始URL作為回退
    }
  }

  async ttsProcess(body: any, req: any, res?: any) {
    const { chatId, prompt } = body;

    const detailKeyInfo = await this.modelsService.getCurrentModelKeyInfo(
      'tts-1'
    );
    const { openaiTimeout, openaiBaseUrl, openaiBaseKey, openaiVoice } =
      await this.globalConfigService.getConfigs([
        'openaiTimeout',
        'openaiBaseUrl',
        'openaiBaseKey',
        'openaiVoice',
      ]);

    // 從 detailKeyInfo 對象中解構賦值並設置默認值
    const { key, proxyUrl, deduct, deductType, timeout } = detailKeyInfo;
    const useKey = key || openaiBaseKey;
    const useUrl = formatUrl(proxyUrl || openaiBaseUrl);
    const useTimeout = (timeout || openaiTimeout) * 1000;

    // 用戶餘額檢測
    await this.userBalanceService.validateBalance(req, deductType, deduct);

    Logger.log('開始 TTS 請求:', prompt, 'TTSService');

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${useUrl}/v1/audio/speech`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useKey}`,
      },
      responseType: 'arraybuffer',
      timeout: useTimeout,
      data: {
        model: 'tts-1',
        input: prompt,
        voice: openaiVoice || 'onyx',
      },
    };

    try {
      const response = await axios(options);
      Logger.log('TTS 請求獲取成功', 'TTSService');

      const buffer = Buffer.from(response.data);
      // const filename = `${uuid.v4().slice(0, 10)}.mp3`;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始，所以+1
      const day = String(now.getDate()).padStart(2, '0');
      const currentDate = `${year}${month}/${day}`;

      const ttsUrl = await this.uploadService.uploadFile(
        { buffer, mimetype: 'audio/mpeg' },
        `audio/openai/${currentDate}`
      );

      // 更新聊天記錄並扣除餘額
      await Promise.all([
        this.chatLogService.updateChatLog(chatId, { ttsUrl }),
        this.userBalanceService.deductFromBalance(
          req.user.id,
          deductType,
          deduct
        ),
      ]);

      res.status(200).send({ ttsUrl });
    } catch (error) {
      Logger.error('TTS 請求或上傳過程失敗:', error, 'TTSService');
      res.status(500).send({ error: 'Failed to process TTS request' });
    }
  }
}
