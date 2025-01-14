import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private isDev: boolean;

  constructor() {
    super();
    this.isDev = process.env.ISDEV === 'TRUE';
  }

  log(message: string, context?: string) {
    super.log(message, context); // 在任何環境下都輸出 log 級別日誌
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context); // 在任何環境下都輸出 error 級別日誌
  }

  warn(message: string, context?: string) {
    if (this.isDev) {
      super.warn(message, context); // 僅在開發環境下輸出 warn 級別日誌
    }
  }

  debug(message: string, context?: string) {
    if (this.isDev) {
      super.debug(message, context); // 僅在開發環境下輸出 debug 級別日誌
    }
  }

  verbose(message: string, context?: string) {
    if (this.isDev) {
      super.verbose(message, context); // 僅在開發環境下輸出 verbose 級別日誌
    }
  }
}
