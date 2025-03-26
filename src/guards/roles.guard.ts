import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../lib/services/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由需要的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置角色限制，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取请求中的用户信息
    const { user } = context.switchToHttp().getRequest();
    
    // 检查用户是否存在且有角色信息
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('无权访问该资源');
    }

    // 检查用户是否有所需角色
    const hasRole = requiredRoles.some(role => user.roles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException(`需要 ${requiredRoles.join(', ')} 角色访问此资源`);
    }
    
    return true;
  }
} 