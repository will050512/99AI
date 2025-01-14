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
var FluxDrawService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxDrawService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const chatLog_service_1 = require("../chatLog/chatLog.service");
const globalConfig_service_1 = require("../globalConfig/globalConfig.service");
const upload_service_1 = require("../upload/upload.service");
const openaiChat_service_1 = require("./openaiChat.service");
let FluxDrawService = FluxDrawService_1 = class FluxDrawService {
    constructor(uploadService, globalConfigService, chatLogService, openAIChatService) {
        this.uploadService = uploadService;
        this.globalConfigService = globalConfigService;
        this.chatLogService = chatLogService;
        this.openAIChatService = openAIChatService;
        this.logger = new common_1.Logger(FluxDrawService_1.name);
    }
    async fluxDraw(inputs, buildMessageFromParentMessageId) {
        var _a, _b, _c, _d;
        common_1.Logger.log('開始遞交 Flux 繪圖任務 ', 'DrawService');
        const { apiKey, model, proxyUrl, prompt, extraParam, timeout, onSuccess, onFailure, groupId, } = inputs;
        const isDalleChat = await this.globalConfigService.getConfigs([
            'isDalleChat',
        ]);
        let drawPrompt;
        if (isDalleChat === '1') {
            try {
                common_1.Logger.log('已開啟連續繪畫模式', 'FluxDraw');
                const { messagesHistory } = await buildMessageFromParentMessageId(`參考上文，結合我的需求，給出繪畫描述。我的需求是：${prompt}`, {
                    groupId,
                    systemMessage: '你是一個繪畫提示詞生成工具，請根據用戶的要求，結合上下文，用一段文字，描述用戶需要的繪畫需求，不用包含任何禮貌性的寒暄,只需要場景的描述,可以適當聯想',
                    maxModelTokens: 8000,
                    maxRounds: 5,
                    fileInfo: '',
                }, this.chatLogService);
                drawPrompt = await this.openAIChatService.chatFree(prompt, undefined, messagesHistory);
            }
            catch (error) {
                console.error('調用chatFree失敗：', error);
                drawPrompt = prompt;
            }
        }
        else {
            drawPrompt = prompt;
        }
        const size = (extraParam === null || extraParam === void 0 ? void 0 : extraParam.size) || '1024x1024';
        let result = { answer: '', fileInfo: '', status: 2 };
        try {
            const options = {
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
                },
            };
            common_1.Logger.log(`正在準備發送請求到 ${options.url}，payload: ${JSON.stringify(options.data)}, headers: ${JSON.stringify(options.headers)}`, 'FluxDrawService');
            const response = await (0, axios_1.default)(options);
            common_1.Logger.debug(`請求成功${JSON.stringify(response.data.data[0])}`);
            common_1.Logger.debug(`請求狀態${JSON.stringify(response.status)}`);
            const url = response.data.data[0].url;
            try {
                common_1.Logger.log(`------> 開始上傳圖片！！！`, 'DrawService');
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const currentDate = `${year}${month}/${day}`;
                result.fileInfo = await this.uploadService.uploadFileFromUrl({
                    url: url,
                    dir: `images/dalle/${currentDate}`,
                });
                common_1.Logger.log(`圖片上傳成功，URL: ${result.fileInfo}`, 'DrawService');
            }
            catch (error) {
                common_1.Logger.error(`上傳圖片過程中出現錯誤: ${error}`, 'DrawService');
            }
            let revised_prompt_cn;
            try {
                revised_prompt_cn = await this.openAIChatService.chatFree(`根據提示詞{${drawPrompt}}, 模擬AI繪畫機器人的語氣，用中文回覆，告訴用戶已經畫好了`);
            }
            catch (error) {
                revised_prompt_cn = `${prompt} 繪製成功`;
                common_1.Logger.error('翻譯失敗: ', error);
            }
            result.answer = revised_prompt_cn;
            result.status = 3;
            onSuccess(result);
            return;
        }
        catch (error) {
            result.status = 5;
            onFailure(result);
            const status = ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
            console.log('draw error: ', JSON.stringify(error), status);
            const message = (_d = (_c = (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message;
            if (status === 429) {
                result.text = '當前請求已過載、請稍等會兒再試試吧！';
                return result;
            }
            if (status === 400 &&
                message.includes('This request has been blocked by our content filters')) {
                result.text = '您的請求已被系統拒絕。您的提示可能存在一些非法的文本。';
                return result;
            }
            if (status === 400 &&
                message.includes('Billing hard limit has been reached')) {
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
};
FluxDrawService = FluxDrawService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [upload_service_1.UploadService,
        globalConfig_service_1.GlobalConfigService,
        chatLog_service_1.ChatLogService,
        openaiChat_service_1.OpenAIChatService])
], FluxDrawService);
exports.FluxDrawService = FluxDrawService;
