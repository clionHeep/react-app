import { NextResponse } from 'next/server';
import { db } from '@/db';
import jwt from 'jsonwebtoken';

// 添加 Prisma 错误类型
interface PrismaError extends Error {
  meta?: unknown;
}

// 类型守卫函数
function isPrismaError(error: unknown): error is PrismaError {
  return error instanceof Error && 'meta' in error;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 添加调试日志
    console.log('尝试注册用户:', email);

    // 检查用户是否已存在
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 });
    }

    // 创建新用户
    const user = await db.user.create({
      data: {
        email,
        password, // 注意：真实环境中应该对密码进行哈希处理
        name: name || email.split('@')[0],
        roles: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('用户创建成功:', user);

    // 生成JWT令牌
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles || 'user'
      },
      accessToken,
      refreshToken
    });
  } catch (error: unknown) {
    // 添加详细错误日志
    const err = error as Error;
    console.error('注册详细错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });

    return NextResponse.json({
      message: '注册失败',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
