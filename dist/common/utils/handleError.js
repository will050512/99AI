"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const axios_1 = require("axios");
function handleError(error) {
    let message = '發生未知錯誤，請稍後再試';
    if (axios_1.default.isAxiosError(error) && error.response) {
        switch (error.response.status) {
            case 400:
                message =
                    '發生錯誤：400 Bad Request - 請求因格式錯誤無法被服務器處理。';
                break;
            case 401:
                message = '發生錯誤：401 Unauthorized - 請求要求進行身份驗證。';
                break;
            case 403:
                message = '發生錯誤：403 Forbidden - 服務器拒絕執行請求。';
                break;
            case 404:
                message = '發生錯誤：404 Not Found - 請求的資源無法在服務器上找到。';
                break;
            case 500:
                message =
                    '發生錯誤：500 Internal Server Error - 服務器內部錯誤，無法完成請求。';
                break;
            case 502:
                message =
                    '發生錯誤：502 Bad Gateway - 作為網關或代理工作的服務器從上游服務器收到無效響應。';
                break;
            case 503:
                message =
                    '發生錯誤：503 Service Unavailable - 服務器暫時處於超負載或維護狀態，無法處理請求。';
                break;
            default:
                break;
        }
    }
    else {
        message = error.message || message;
    }
    return message;
}
exports.handleError = handleError;
