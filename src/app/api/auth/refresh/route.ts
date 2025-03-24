import { NextResponse } from 'next/server';
import { db } from '@/db';
import jwt from 'jsonwebtoken';

// 添加 Prisma 错误类型
interface PrismaError extends Error {
  meta?: unknown;
}

// JWT负载类型
interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
}

// 类型守卫函数
function isPrismaError(error: unknown): error is PrismaError {
  return error instanceof Error && 'meta' in error;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ message: '刷新令牌不能为空' }, { status: 401 });
    }

    // 验证刷新令牌
    try {
      // 先将decoded设为unknown，然后再转换类型
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as unknown as JwtPayload;
      const userId = decoded.sub;

      // 查询用户信息
      const user = await db.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return NextResponse.json({ message: '用户不存在' }, { status: 401 });
      }

      // 检查用户状态
      if (user.status !== 'ACTIVE') {
        return NextResponse.json({ message: '账户已被锁定或禁用' }, { status: 401 });
      }

      // 生成新的JWT令牌
      const accessToken = jwt.sign(
        { sub: user.id, username: user.username },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );

      const newRefreshToken = jwt.sign(
        { sub: user.id },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError);
      return NextResponse.json({ message: '刷新令牌无效或已过期' }, { status: 401 });
    }
  } catch (error: unknown) {
    // 添加详细错误日志
    const err = error as Error;
    console.error('刷新令牌错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });

    return NextResponse.json({
      message: '刷新令牌失败',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

