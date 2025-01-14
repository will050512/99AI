export class Result<T> {
	code: number;
	data?: T;
	success: boolean;
	message?: string;

	constructor(code: number, success: boolean, data?: T, message?: string) {
		this.code = code;
		this.data = data;
		this.success = success;
		this.message = message;
	}

	static success<T>(data?: T, message = '請求成功'): Result<T> {
		return new Result<T>(200, true, data, message);
	}

	static fail<T>(code: number, message = '請求失敗', data?: T): Result<T> {
		return new Result<T>(code, false, data, message);
	}
}
