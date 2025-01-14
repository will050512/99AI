import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwtAuth.guard';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthorized = await super.canActivate(context);
    if (!isAuthorized) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user && ['admin', 'super'].includes(user.role)) {
      return true;
    } else {
      throw new UnauthorizedException('非法操作、您的權限等級不足、無法執行當前請求！');
    }
  }
}
