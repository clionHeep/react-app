import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { UserInfo } from '../types/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 添加自定义的身份验证逻辑
    return super.canActivate(context);
  }

  // 使用泛型保持与基类兼容
  handleRequest<TUser = UserInfo>(
    err: Error | null, 
    user: TUser | false, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info: unknown, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ExecutionContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    status?: number
  ): TUser {
    // 自定义错误处理
    if (err || !user) {
      throw err || new UnauthorizedException('未授权访问');
    }
    return user;
  }
}
