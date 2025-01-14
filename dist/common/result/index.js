"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
class Result {
    constructor(code, success, data, message) {
        this.code = code;
        this.data = data;
        this.success = success;
        this.message = message;
    }
    static success(data, message = '請求成功') {
        return new Result(200, true, data, message);
    }
    static fail(code, message = '請求失敗', data) {
        return new Result(code, false, data, message);
    }
}
exports.Result = Result;
