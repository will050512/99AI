"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const utils_1 = require("../../common/utils");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("axios");
const typeorm_2 = require("typeorm");
const aiPPT_1 = require("../ai/aiPPT");
const cogVideo_service_1 = require("../ai/cogVideo.service");
const fluxDraw_service_1 = require("../ai/fluxDraw.service");
const lumaVideo_service_1 = require("../ai/lumaVideo.service");
const midjourneyDraw_service_1 = require("../ai/midjourneyDraw.service");
const openaiChat_service_1 = require("../ai/openaiChat.service");
const openaiDraw_service_1 = require("../ai/openaiDraw.service");
const stableDiffusion_service_1 = require("../ai/stableDiffusion.service");
const suno_service_1 = require("../ai/suno.service");
const app_entity_1 = require("../app/app.entity");
const autoreply_service_1 = require("../autoreply/autoreply.service");
const badWords_service_1 = require("../badWords/badWords.service");
const chatGroup_service_1 = require("../chatGroup/chatGroup.service");
const chatLog_service_1 = require("../chatLog/chatLog.service");
const config_entity_1 = require("../globalConfig/config.entity");
const globalConfig_service_1 = require("../globalConfig/globalConfig.service");
const models_service_1 = require("../models/models.service");
const plugin_entity_1 = require("../plugin/plugin.entity");
const upload_service_1 = require("../upload/upload.service");
const user_service_1 = require("../user/user.service");
const userBalance_service_1 = require("../userBalance/userBalance.service");
let ChatService = class ChatService {
    constructor(configEntity, appEntity, pluginEntity, sunoService, openAIChatService, chatLogService, midjourneyService, stableDiffusionService, userBalanceService, userService, uploadService, badWordsService, autoreplyService, globalConfigService, chatGroupService, modelsService, openAIDrawService, lumaVideoService, cogVideoService, fluxDrawService, aiPptService) {
        this.configEntity = configEntity;
        this.appEntity = appEntity;
        this.pluginEntity = pluginEntity;
        this.sunoService = sunoService;
        this.openAIChatService = openAIChatService;
        this.chatLogService = chatLogService;
        this.midjourneyService = midjourneyService;
        this.stableDiffusionService = stableDiffusionService;
        this.userBalanceService = userBalanceService;
        this.userService = userService;
        this.uploadService = uploadService;
        this.badWordsService = badWordsService;
        this.autoreplyService = autoreplyService;
        this.globalConfigService = globalConfigService;
        this.chatGroupService = chatGroupService;
        this.modelsService = modelsService;
        this.openAIDrawService = openAIDrawService;
        this.lumaVideoService = lumaVideoService;
        this.cogVideoService = cogVideoService;
        this.fluxDrawService = fluxDrawService;
        this.aiPptService = aiPptService;
    }
    async chatProcess(body, req, res) {
        await this.userBalanceService.checkUserCertification(req.user.id);
        const { options = {}, usingPluginId, appId = null, specialModel, prompt, fileInfo, extraParam, model, drawId, customId, action, modelName, modelAvatar, } = body;
        let appInfo;
        if (specialModel) {
            appInfo = await this.appEntity.findOne({
                where: { des: specialModel, isSystemReserved: true },
            });
        }
        else if (appId) {
            appInfo = await this.appEntity.findOne({
                where: { id: appId, status: (0, typeorm_2.In)([1, 3, 4, 5]) },
            });
            if (!appInfo) {
                throw new common_1.HttpException('你當前使用的應用已被下架、請刪除當前對話開啟新的對話吧！', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const { groupId, fileParsing } = options;
        const { openaiTimeout, openaiBaseUrl, openaiBaseKey, systemPreMessage, isMjTranslate, mjTranslatePrompt, openaiTemperature, openaiBaseModel, isGeneratePromptReference, isConvertToBase64, isSensitiveWordFilter, } = await this.globalConfigService.getConfigs([
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
        await this.userService.checkUserStatus(req.user);
        res &&
            res.setHeader('Content-type', 'application/octet-stream; charset=utf-8');
        if (isSensitiveWordFilter === '1') {
            const triggeredWords = await this.badWordsService.checkBadWords(prompt, req.user.id);
            if (triggeredWords.length > 0) {
                const tips = `您遞交的資訊中包含違規的內容，我們已對您的賬戶進行標記，請合規使用！`;
                throw new common_1.HttpException(tips, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const autoReplyRes = await this.autoreplyService.checkAutoReply(prompt);
        let currentRequestModelKey = null;
        let appName = '';
        let setSystemMessage = '';
        res && res.status(200);
        let response = null;
        const curIp = (0, utils_1.getClientIp)(req);
        let usePrompt;
        let useModelAvatar = '';
        let usingPlugin;
        if (usingPluginId) {
            usingPlugin = await this.pluginEntity.findOne({
                where: { id: usingPluginId },
            });
        }
        if (appInfo) {
            const { isGPTs, gizmoID, name, isFixedModel, appModel, coverImg } = appInfo;
            useModelAvatar = coverImg;
            appName = name;
            if (isGPTs) {
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo('gpts');
                currentRequestModelKey.model = `gpt-4-gizmo-${gizmoID}`;
            }
            else if (!isGPTs && isFixedModel && appModel) {
                appInfo.preset && (setSystemMessage = appInfo.preset);
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo(appModel);
                currentRequestModelKey.model = appModel;
                if (fileParsing) {
                    setSystemMessage = `${setSystemMessage}以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
                }
                common_1.Logger.log(`固定模型、使用應用預設: ${setSystemMessage}`, 'ChatService');
            }
            else {
                appInfo.preset && (setSystemMessage = appInfo.preset);
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo(model);
                if (fileParsing) {
                    setSystemMessage = `${setSystemMessage}以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
                }
                common_1.Logger.log(`使用應用預設: ${setSystemMessage}`, 'ChatService');
            }
        }
        else {
            const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);
            if (usingPlugin && usingPlugin.isSystemPlugin === 0) {
                let pluginPrompt = '';
                try {
                    pluginPrompt = await this.usePlugin(prompt, usingPlugin.parameters);
                    common_1.Logger.log(`外掛返回結果: ${pluginPrompt}`, 'ChatService');
                }
                catch (error) {
                    pluginPrompt = prompt;
                    common_1.Logger.error(`外掛調用錯誤: ${error}`);
                }
                setSystemMessage = pluginPrompt;
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo(model);
                common_1.Logger.log(`使用外掛預設: ${setSystemMessage}`, 'ChatService');
            }
            else if (fileParsing) {
                setSystemMessage = `以下是我提供給你的知識庫：【${fileParsing}】，在回答問題之前，先檢索知識庫內有沒有相關的內容，儘量使用知識庫中獲取到的資訊來回答我的問題，以知識庫中的為準。`;
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo(model);
                common_1.Logger.log(`使用文件解析: ${setSystemMessage}`, 'ChatService');
            }
            else {
                const currentDate = new Date().toISOString().split('T')[0];
                setSystemMessage = systemPreMessage + `\n Current date: ${currentDate}`;
                currentRequestModelKey =
                    await this.modelsService.getCurrentModelKeyInfo(model);
                common_1.Logger.log(`使用全局預設: ${setSystemMessage}`, 'ChatService');
            }
        }
        if (!currentRequestModelKey) {
            common_1.Logger.debug('未找到當前模型key，切換至全局模型', 'ChatService');
            currentRequestModelKey = await this.modelsService.getCurrentModelKeyInfo(openaiBaseModel);
            const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);
            let updatedConfig = groupInfo.config;
            try {
                const parsedConfig = JSON.parse(groupInfo.config);
                if (parsedConfig.modelInfo) {
                    parsedConfig.modelInfo.modelName = currentRequestModelKey.modelName;
                    parsedConfig.modelInfo.model = currentRequestModelKey.model;
                    updatedConfig = JSON.stringify(parsedConfig);
                }
            }
            catch (error) {
                common_1.Logger.debug('模型切換錯誤，請檢查全局模型配置！', 'ChatService');
                throw new common_1.HttpException('配置解析錯誤！', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.chatGroupService.update({
                groupId,
                title: groupInfo.title,
                isSticky: false,
                config: updatedConfig,
                fileUrl: '',
            }, req);
        }
        const { deduct, isTokenBased, tokenFeeRatio, deductType, key, id: keyId, maxRounds, proxyUrl, maxModelTokens, timeout, model: useModel, isFileUpload, keyType: modelType, } = currentRequestModelKey;
        if (await this.chatLogService.checkModelLimits(req.user, useModel)) {
            throw new common_1.HttpException('1 小時內對話次數過多，請切換模型或稍後再試！', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (isMjTranslate === '1' &&
            action === 'IMAGINE' &&
            model === 'midjourney') {
            const [beforeArgs, afterArgs] = prompt.split(/(?= --)/);
            const urlPattern = /(https?:\/\/[^\s]+)/g;
            const urls = beforeArgs.match(urlPattern) || [];
            let textToTranslate = beforeArgs.replace(urlPattern, '').trim();
            const translatedText = await this.openAIChatService.chatFree(textToTranslate, mjTranslatePrompt ||
                "Translate any given phrase from any language into English. For instance, when I input '{可愛的熊貓}', you should output '{cute panda}', with no period at the end.");
            const finalTranslatedPrompt = [...urls, translatedText].join(' ').trim();
            usePrompt = afterArgs
                ? `${finalTranslatedPrompt}${afterArgs}`
                : finalTranslatedPrompt;
            if (isFileUpload === '1' && fileInfo) {
                usePrompt = `${fileInfo} ${usePrompt}`;
            }
        }
        else {
            usePrompt =
                isFileUpload === '1' && fileInfo ? fileInfo + ' ' + prompt : prompt;
        }
        await this.userBalanceService.validateBalance(req, deductType, deduct);
        const useModeName = modelName;
        const proxyResUrl = (0, utils_1.formatUrl)(proxyUrl || openaiBaseUrl || 'https://api.openai.com');
        const modelKey = key || openaiBaseKey;
        const modelTimeout = (timeout || openaiTimeout || 300) * 1000;
        const temperature = Number(openaiTemperature) || 1;
        if (groupId) {
            const groupInfo = await this.chatGroupService.getGroupInfoFromId(groupId);
            this.updateChatTitle(groupId, groupInfo, modelType, prompt, req);
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
            modelAvatar: (usingPlugin === null || usingPlugin === void 0 ? void 0 : usingPlugin.pluginImg) || useModelAvatar || modelAvatar || '',
            pluginParam: (usingPlugin === null || usingPlugin === void 0 ? void 0 : usingPlugin.parameters)
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
                const sendCharByChar = (index) => {
                    if (index < chars.length) {
                        const msg = { text: chars[index] };
                        res.write(`${JSON.stringify(msg)}\n`);
                        setTimeout(() => sendCharByChar(index + 1), 10);
                    }
                    else {
                        res.end();
                    }
                };
                sendCharByChar(0);
                await this.chatLogService.updateChatLog(assistantLogId, {
                    answer: autoReplyRes.answer,
                });
                return;
            }
            else {
                setSystemMessage = setSystemMessage + autoReplyRes.answer;
            }
        }
        const { messagesHistory } = await this.buildMessageFromParentMessageId(prompt, {
            groupId,
            systemMessage: setSystemMessage,
            maxModelTokens,
            maxRounds: maxRounds,
            isConvertToBase64: isConvertToBase64,
            fileInfo: fileInfo,
            model: useModel,
            isFileUpload,
        }, this.chatLogService);
        let charge = action !== 'UPSCALE' && useModel === 'midjourney' ? deduct * 4 : deduct;
        const abortController = new AbortController();
        try {
            if (res) {
                res.on('close', () => {
                    abortController.abort();
                });
                let response;
                let firstChunk = true;
                try {
                    if ((useModel === 'dall-e-3' ||
                        useModel === 'midjourney' ||
                        useModel === 'ai-ppt' ||
                        useModel === 'suno-music' ||
                        useModel === 'luma-video' ||
                        useModel.includes('stable-diffusion') ||
                        useModel.includes('cog-video') ||
                        useModel.includes('flux')) &&
                        modelType === 2) {
                        if (useModel === 'dall-e-3') {
                            response = this.openAIDrawService.dalleDraw({
                                prompt: prompt,
                                extraParam: extraParam,
                                apiKey: modelKey,
                                proxyUrl: proxyResUrl,
                                model: useModel,
                                timeout: modelTimeout,
                                modelName: useModeName,
                                groupId: groupId,
                                onSuccess: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        progress: '100%',
                                        status: data.status,
                                    });
                                },
                                onFailure: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        answer: '繪圖失敗',
                                        status: data.status,
                                    });
                                },
                            }, this.buildMessageFromParentMessageId);
                            await this.chatLogService.updateChatLog(assistantLogId, {
                                answer: '繪製中',
                            });
                        }
                        else if (useModel === 'ai-ppt') {
                            common_1.Logger.log('開始生成PPT', 'DrawService');
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
                        }
                        else if (useModel.includes('flux')) {
                            response = this.fluxDrawService.fluxDraw({
                                prompt: prompt,
                                extraParam: extraParam,
                                apiKey: modelKey,
                                proxyUrl: proxyResUrl,
                                model: useModel,
                                timeout: modelTimeout,
                                modelName: useModeName,
                                groupId: groupId,
                                onSuccess: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        progress: '100%',
                                        status: data.status,
                                    });
                                },
                                onFailure: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        answer: '繪圖失敗',
                                        status: data.status,
                                    });
                                },
                            }, this.buildMessageFromParentMessageId);
                            await this.chatLogService.updateChatLog(assistantLogId, {
                                answer: '繪製中',
                            });
                        }
                        else if (useModel.includes('suno-music')) {
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
                        }
                        else if (useModel.includes('luma-video')) {
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
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        status: 2,
                                    });
                                },
                                onSuccess: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        progress: '100%',
                                        status: 3,
                                    });
                                },
                                onFailure: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        answer: data.errMsg,
                                        status: 4,
                                    });
                                },
                            });
                            await this.chatLogService.updateChatLog(assistantLogId, {
                                answer: '遞交成功，視頻生成中',
                            });
                        }
                        else if (useModel.includes('cog-video')) {
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
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        status: 2,
                                    });
                                },
                                onSuccess: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        progress: '100%',
                                        status: 3,
                                    });
                                },
                                onFailure: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        answer: data.errMsg,
                                        status: 4,
                                    });
                                },
                            });
                            await this.chatLogService.updateChatLog(assistantLogId, {
                                answer: '遞交成功，視頻生成中',
                            });
                        }
                        else if (useModel.includes('stable-diffusion')) {
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
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        fileInfo: data === null || data === void 0 ? void 0 : data.fileInfo,
                                        answer: (data === null || data === void 0 ? void 0 : data.answer) || prompt,
                                        progress: '100%',
                                        status: 3,
                                    });
                                },
                                onFailure: async (data) => {
                                    await this.chatLogService.updateChatLog(assistantLogId, {
                                        answer: '生成失敗',
                                        status: 4,
                                    });
                                },
                            });
                            await this.chatLogService.updateChatLog(assistantLogId, {
                                answer: '繪製中',
                            });
                        }
                        else {
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
                        if (response.status !== 5) {
                            await this.modelsService.saveUseLog(keyId, 1);
                            await this.userBalanceService.deductFromBalance(req.user.id, deductType, charge);
                        }
                        else {
                            common_1.Logger.log('任務遞交失敗，不執行扣費', 'ChatService');
                        }
                        const userBalance = await this.userBalanceService.queryUserBalance(req.user.id);
                        response.userBalance = Object.assign({}, userBalance);
                        response.text = response.answer;
                        response.status = response.status || 2;
                        response.model = model;
                        response.modelName = modelName;
                        return res.write(`\n${JSON.stringify(response)}`);
                    }
                    else {
                        response = await this.openAIChatService.openAIChat(messagesHistory, {
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
                                res.write(firstChunk
                                    ? JSON.stringify(chat)
                                    : `\n${JSON.stringify(chat)}`);
                                firstChunk = false;
                            },
                            onFailure: async (data) => {
                                await this.chatLogService.updateChatLog(assistantLogId, {
                                    answer: data.errMsg,
                                    status: 4,
                                });
                            },
                            abortController,
                        });
                        if (response.errMsg) {
                            common_1.Logger.error(`用戶ID: ${req.user.id} 模型名稱: ${useModeName} 模型: ${model} 回覆出錯，本次不扣除積分`, 'ChatService');
                            return res.write(`\n${JSON.stringify(response)}`);
                        }
                        let totalText = '';
                        messagesHistory.forEach((messagesHistory) => {
                            totalText += messagesHistory.content + ' ';
                        });
                        const promptTokens = await (0, utils_1.getTokenCount)(totalText);
                        const completionTokens = await (0, utils_1.getTokenCount)(response.answer);
                        await this.chatLogService.updateChatLog(userLogId, {
                            promptTokens: promptTokens,
                            completionTokens: completionTokens,
                            totalTokens: promptTokens + completionTokens,
                        });
                        let sanitizedAnswer = response.answer;
                        if (isSensitiveWordFilter === '1') {
                            const triggeredWords = await this.badWordsService.checkBadWords(response.answer, req.user.id);
                            if (triggeredWords.length > 0) {
                                const regex = new RegExp(triggeredWords.join('|'), 'gi');
                                sanitizedAnswer = sanitizedAnswer.replace(regex, (matched) => '*'.repeat(matched.length));
                            }
                        }
                        await this.chatLogService.updateChatLog(assistantLogId, {
                            fileInfo: response === null || response === void 0 ? void 0 : response.fileInfo,
                            answer: sanitizedAnswer,
                            promptTokens: promptTokens,
                            completionTokens: completionTokens,
                            totalTokens: promptTokens + completionTokens,
                            status: 3,
                        });
                        try {
                            if (isGeneratePromptReference === '1') {
                                const promptReference = await this.openAIChatService.chatFree(`根據用戶提問{${prompt}}以及 AI 的回答{${response.answer}}，生成三個更進入一步的提問，用{}包裹每個問題，不需要分行，不需要其他任何內容，單個提問不超過30個字`);
                                await this.chatLogService.updateChatLog(assistantLogId, {
                                    promptReference: promptReference,
                                });
                            }
                        }
                        catch (error) {
                            common_1.Logger.error(`調用 chatFree 出錯: ${error}`);
                        }
                        if (isTokenBased === true) {
                            charge =
                                deduct *
                                    Math.ceil((promptTokens + completionTokens) / tokenFeeRatio);
                        }
                        await this.userBalanceService.deductFromBalance(req.user.id, deductType, charge, promptTokens + completionTokens);
                        await this.modelsService.saveUseLog(keyId, promptTokens + completionTokens);
                        common_1.Logger.log(`用戶ID: ${req.user.id} 模型名稱: ${useModeName} 模型: ${model} 消耗token: ${promptTokens + completionTokens}, 消耗積分： ${charge}`, 'ChatService');
                        const userBalance = await this.userBalanceService.queryUserBalance(req.user.id);
                        response.userBalance = Object.assign({}, userBalance);
                        return res.write(`\n${JSON.stringify(response)}`);
                    }
                }
                catch (error) {
                    common_1.Logger.error('發生錯誤:', error);
                    await this.chatLogService.updateChatLog(assistantLogId, {
                        status: 5,
                    });
                    response = { error: '處理請求時發生錯誤' };
                }
            }
            else {
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
                await this.userBalanceService.deductFromBalance(req.user.id, deductType, charge);
                return response.answer;
            }
        }
        catch (error) {
            common_1.Logger.error('chat-error <----------------------------------------->', modelKey, error);
            if (res) {
                return res.write('發生未知錯誤，請稍後再試');
            }
            else {
                throw new common_1.HttpException('發生未知錯誤，請稍後再試', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        finally {
            res && res.end();
        }
    }
    async usePlugin(prompt, pluginParam) {
        const { pluginUrl, pluginKey } = await this.globalConfigService.getConfigs([
            'pluginUrl',
            'pluginKey',
        ]);
        const key = pluginKey;
        const proxyUrl = pluginUrl;
        const options = {
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
            const response = await (0, axios_1.default)(options);
            common_1.Logger.log(`外掛調用成功 返回結果: ${JSON.stringify(response.data, null, 2)}`, 'PluginService');
            return response.data.text;
        }
        catch (error) {
            common_1.Logger.error('error: ', error);
        }
    }
    async updateChatTitle(groupId, groupInfo, modelType, prompt, req) {
        if ((groupInfo === null || groupInfo === void 0 ? void 0 : groupInfo.title) === '新對話') {
            let chatTitle;
            if (modelType === 1) {
                try {
                    chatTitle = await this.openAIChatService.chatFree(`根據用戶提問{${prompt}}，給這個對話取一個名字，不超過10個字`);
                    if (chatTitle.length > 15) {
                        chatTitle = chatTitle.slice(0, 15);
                    }
                }
                catch (error) {
                    common_1.Logger.error(`調用 chatFree 出錯: ${error}`);
                    chatTitle = prompt.slice(0, 10);
                }
            }
            else {
                chatTitle = '創意 AI';
            }
            this.chatGroupService
                .update({
                groupId,
                title: chatTitle,
                isSticky: false,
                config: '',
                fileUrl: '',
            }, req)
                .then(() => common_1.Logger.log(`更新標題名稱為: ${chatTitle}`, 'ChatService'))
                .catch((error) => common_1.Logger.error(`更新對話組標題失敗: ${error}`));
        }
    }
    async buildMessageFromParentMessageId(text, options, chatLogService) {
        let { systemMessage = '', fileInfo, groupId, maxRounds = 5, maxModelTokens = 8000, isFileUpload = 0, isConvertToBase64, } = options;
        if (systemMessage.length > maxModelTokens) {
            common_1.Logger.log('系統消息超過最大長度，將被截斷', 'ChatService');
            systemMessage = systemMessage.slice(0, maxModelTokens);
        }
        let messages = [];
        if (systemMessage) {
            messages.push({ role: 'system', content: systemMessage });
        }
        if (groupId) {
            const history = await chatLogService.chatHistory(groupId, maxRounds);
            let tempUserMessage = null;
            for (const record of history) {
                try {
                    let content;
                    if ((isFileUpload === 2 || isFileUpload === 3) &&
                        record.fileInfo &&
                        record.role === 'user') {
                        const imageUrls = await Promise.all(record.fileInfo.split(',').map(async (url) => ({
                            type: 'image_url',
                            image_url: {
                                url: isConvertToBase64 === '1'
                                    ? await this.convertUrlToBase64(url.trim())
                                    : url.trim(),
                            },
                        })));
                        content = [{ type: 'text', text: record.text }, ...imageUrls];
                    }
                    else if (isFileUpload === 1 &&
                        record.fileInfo &&
                        record.role === 'user') {
                        content = record.fileInfo + '\n' + record.text;
                    }
                    else {
                        content = record.text;
                    }
                    if (record.role === 'user') {
                        tempUserMessage = { role: record.role, content };
                    }
                    else if (record.role === 'assistant') {
                        const contentStr = Array.isArray(content)
                            ? JSON.stringify(content)
                            : content;
                        if (tempUserMessage && contentStr.trim() !== '') {
                            messages.push(tempUserMessage);
                            messages.push({ role: record.role, content });
                            tempUserMessage = null;
                        }
                    }
                }
                catch (error) {
                    common_1.Logger.error('處理歷史記錄時出錯:', error, '記錄:', JSON.stringify(record, null, 2));
                }
            }
        }
        let currentMessageContent;
        if ((isFileUpload === 2 || isFileUpload === 3) && fileInfo) {
            const imageUrls = await Promise.all(fileInfo.split(',').map(async (url) => ({
                type: 'image_url',
                image_url: {
                    url: isConvertToBase64 === '1'
                        ? await this.convertUrlToBase64(url.trim())
                        : url.trim(),
                },
            })));
            currentMessageContent = [{ type: 'text', text }, ...imageUrls];
        }
        else if (isFileUpload === 1 && fileInfo) {
            currentMessageContent = fileInfo + '\n' + text;
        }
        else {
            currentMessageContent = text;
        }
        messages.push({ role: 'user', content: currentMessageContent });
        let totalTokens = await (0, utils_1.getTokenCount)(messages);
        let tokenLimit;
        if (maxModelTokens < 8000) {
            tokenLimit = 4000;
        }
        else {
            tokenLimit = maxModelTokens - 4000;
        }
        while (totalTokens > tokenLimit) {
            if (messages.length === 2 &&
                messages[0].role === 'system' &&
                messages[1].role === 'user') {
                break;
            }
            let foundPairToDelete = false;
            for (let i = 0; i < messages.length; i++) {
                if (messages[i].role !== 'system' &&
                    messages[i + 1] &&
                    messages[i + 1].role === 'assistant') {
                    messages.splice(i, 2);
                    foundPairToDelete = true;
                    break;
                }
            }
            if (!foundPairToDelete) {
                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].role === 'user') {
                        messages.splice(i, 1);
                        break;
                    }
                }
            }
            totalTokens = await (0, utils_1.getTokenCount)(messages);
            if (messages.length <= 2) {
                break;
            }
        }
        return {
            messagesHistory: messages,
            round: messages.length,
        };
    }
    async convertUrlToBase64(url) {
        try {
            console.log(`正在嘗試轉換URL為Base64: ${url}`);
            const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            console.log(`成功獲取圖片，正在轉換為Base64: ${url}`);
            const base64Data = `data:${response.headers['content-type']};base64,${buffer.toString('base64')}`;
            console.log(`成功轉換URL為Base64: ${url}`);
            return base64Data;
        }
        catch (error) {
            console.error('轉換URL為Base64時發生錯誤:', error);
            console.warn(`返回原始鏈接: ${url}`);
            return url;
        }
    }
    async ttsProcess(body, req, res) {
        const { chatId, prompt } = body;
        const detailKeyInfo = await this.modelsService.getCurrentModelKeyInfo('tts-1');
        const { openaiTimeout, openaiBaseUrl, openaiBaseKey, openaiVoice } = await this.globalConfigService.getConfigs([
            'openaiTimeout',
            'openaiBaseUrl',
            'openaiBaseKey',
            'openaiVoice',
        ]);
        const { key, proxyUrl, deduct, deductType, timeout } = detailKeyInfo;
        const useKey = key || openaiBaseKey;
        const useUrl = (0, utils_1.formatUrl)(proxyUrl || openaiBaseUrl);
        const useTimeout = (timeout || openaiTimeout) * 1000;
        await this.userBalanceService.validateBalance(req, deductType, deduct);
        common_1.Logger.log('開始 TTS 請求:', prompt, 'TTSService');
        const options = {
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
            const response = await (0, axios_1.default)(options);
            common_1.Logger.log('TTS 請求獲取成功', 'TTSService');
            const buffer = Buffer.from(response.data);
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const currentDate = `${year}${month}/${day}`;
            const ttsUrl = await this.uploadService.uploadFile({ buffer, mimetype: 'audio/mpeg' }, `audio/openai/${currentDate}`);
            await Promise.all([
                this.chatLogService.updateChatLog(chatId, { ttsUrl }),
                this.userBalanceService.deductFromBalance(req.user.id, deductType, deduct),
            ]);
            res.status(200).send({ ttsUrl });
        }
        catch (error) {
            common_1.Logger.error('TTS 請求或上傳過程失敗:', error, 'TTSService');
            res.status(500).send({ error: 'Failed to process TTS request' });
        }
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(config_entity_1.ConfigEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(app_entity_1.AppEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(plugin_entity_1.PluginEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        suno_service_1.SunoService,
        openaiChat_service_1.OpenAIChatService,
        chatLog_service_1.ChatLogService,
        midjourneyDraw_service_1.MidjourneyService,
        stableDiffusion_service_1.StableDiffusionService,
        userBalance_service_1.UserBalanceService,
        user_service_1.UserService,
        upload_service_1.UploadService,
        badWords_service_1.BadWordsService,
        autoreply_service_1.AutoreplyService,
        globalConfig_service_1.GlobalConfigService,
        chatGroup_service_1.ChatGroupService,
        models_service_1.ModelsService,
        openaiDraw_service_1.OpenAIDrawService,
        lumaVideo_service_1.LumaVideoService,
        cogVideo_service_1.CogVideoService,
        fluxDraw_service_1.FluxDrawService,
        aiPPT_1.AiPptService])
], ChatService);
exports.ChatService = ChatService;
