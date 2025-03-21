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
    const { email, password } = body;

    // 添加调试日志
    console.log('尝试登录用户:', email);
    console.log('提交的密码:', password);

    // 首先只查询用户基本信息
    const user = await db.user.findUnique({ 
      where: { email }
    });

    console.log('查询到用户:', user);
    
    if (!user) {
      console.log('认证失败: 用户不存在');
      return NextResponse.json({ message: '用户不存在' }, { status: 401 });
    }

    console.log('数据库中的密码:', user.password);
    console.log('密码比较:', `提交的密码(${password}) ${password === user.password ? '===': '!=='} 数据库密码(${user.password})`);

    if (user.password !== password) {
      console.log('认证失败: 密码错误');
      return NextResponse.json({ message: '密码错误' }, { status: 401 });
    }

    console.log('密码验证通过，正在生成令牌');
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

    // 简化返回数据，避免关系查询
    return NextResponse.json({
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        roles: user.roles || 'user' // 使用用户表中的roles字段
      },
      accessToken,
      refreshToken
    });
  } catch (error: unknown) {
    // 添加详细错误日志
    const err = error as Error;
    console.error('登录详细错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });
    
    return NextResponse.json({ 
      message: '登录失败',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

// db.user.create({
//   data: {
//     email: 'test@test.com',
//     name: 'test',
//     password: 'test',
//     avatar: 'https://example.com/avatar.jpg',
//     updatedAt: new Date(),
//     createdAt: new Date()
//   }
// }).then(res => {
//   console.log(res);
// })

// db.user.findMany().then(res => {
//   console.log(res);
// })

// db.user.update({
//   where: { email: 'admin@example.com' },
//   data: { password: 'admin123' }
// }).then(user => {
//   console.log('密码更新成功:', user);
// });