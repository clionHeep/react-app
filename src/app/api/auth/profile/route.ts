import { NextResponse } from 'next/server';
import { db } from '@/db';
import jwt from 'jsonwebtoken';

// JWT负载类型
interface JwtPayload {
  sub: number;
  username?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: Request) {
  try {
    // 获取请求头中的授权信息
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: '未提供授权信息' }, { status: 401 });
    }
    
    // 从授权头中提取令牌
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as unknown as JwtPayload;
      const userId = decoded.sub;
      
      // 查询用户信息，包括角色和权限
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
        return NextResponse.json({ message: '用户不存在' }, { status: 404 });
      }
      
      // 检查用户状态
      if (user.status !== 'ACTIVE') {
        return NextResponse.json({ message: '账户已被锁定或禁用' }, { status: 403 });
      }
      
      // 提取用户角色
      const roles = user.userrole?.map(ur => ur.role.name) || [];
      
      // 构建用户资料响应
      const userResponse = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles,
        // 添加其他需要的字段，但不包括密码
      };
      
      return NextResponse.json(userResponse);
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError);
      return NextResponse.json({ message: '无效的令牌或令牌已过期' }, { status: 401 });
    }
  } catch (error) {
    console.error('获取用户资料错误:', error);
    return NextResponse.json({ 
      message: '获取用户资料失败',
      detail: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
} 