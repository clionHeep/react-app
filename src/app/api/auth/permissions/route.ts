import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
  username?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
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
      return NextResponse.json({
        status: 401,
        msg: '未认证',
        data: null
      });
    }

    // 验证token
    let userInfo: JwtPayload;
    try {
      userInfo = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    } catch (error) {
      console.error('JWT验证失败:', error);
      return NextResponse.json({
        status: 401,
        msg: '无效的令牌',
        data: null
      });
    }

    // 获取用户ID
    const userId = userInfo.sub;
    
    // 从数据库查询用户信息
    const user = await db.user.findUnique({
      where: { id: Number(userId) },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        status: 404,
        msg: '用户不存在',
        data: null
      });
    }

    // 获取用户角色
    const userRoles = user.userrole?.map(ur => ur.role.name) || [];
    
    // 这里假设我们有一个从数据库或其他地方获取权限配置的方法
    // 这里仅作为示例，实际应用中应从数据库获取
    const routePermissions = {
      '/dashboard': { 
        requireAuth: true 
      },
      '/dashboard/analytics': { 
        requireAuth: true, 
        roles: ['admin', 'analyst'] 
      },
      '/dashboard/workspace': { 
        requireAuth: true 
      },
      '/users': { 
        requireAuth: true, 
        roles: ['admin'] 
      },
      '/settings': { 
        requireAuth: true, 
        roles: ['admin'] 
      },
      '/system': { 
        requireAuth: true, 
        roles: ['admin'] 
      },
      '/dev-tools': { 
        requireAuth: true, 
        roles: ['developer', 'admin'] 
      },
      '/content': { 
        requireAuth: true 
      },
      '/e-commerce': { 
        requireAuth: true 
      }
    };

    return NextResponse.json({
      status: 200,
      msg: '获取权限配置成功',
      data: {
        roles: userRoles,
        routePermissions
      }
    });
  } catch (error) {
    console.error('获取权限配置失败:', error);
    return NextResponse.json({
      status: 500,
      msg: '服务器错误',
      data: null
    });
  }
} 