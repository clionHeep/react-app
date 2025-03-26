import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
  username?: string;
}

// 验证是否为管理员
export async function verifyAdmin(request: NextRequest) {
  try {
    // 获取token
    let token: string | undefined;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const tokenFromCookie = request.cookies.get('token')?.value;
      if (tokenFromCookie) {
        token = tokenFromCookie;
      }
    }

    if (!token) {
      return {
        success: false,
        status: 401,
        message: '未认证'
      };
    }

    // 验证token
    let userInfo: JwtPayload;
    try {
      userInfo = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    } catch {
      return {
        success: false,
        status: 401,
        message: '无效的令牌'
      };
    }

    // 获取用户ID
    const userId = Number(userInfo.sub);
    
    // 查询用户及其角色
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return {
        success: false,
        status: 404,
        message: '用户不存在'
      };
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      return {
        success: false,
        status: 403,
        message: '账户已被禁用'
      };
    }

    // 检查用户是否有管理员角色
    const roleNames = user.userrole.map(ur => ur.role.name);
    if (!roleNames.includes('admin')) {
      return {
        success: false,
        status: 403,
        message: '无管理员权限'
      };
    }

    return {
      success: true,
      status: 200,
      message: '验证成功'
    };
  } catch (error) {
    console.error('权限验证失败:', error);
    return {
      success: false,
      status: 500,
      message: '服务器错误'
    };
  }
} 