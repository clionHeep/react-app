import { NextResponse } from 'next/server';
import { db } from '@/db';

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
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json({ message: '手机号不能为空' }, { status: 400 });
    }
    
    // 验证手机号是否注册
    const user = await db.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ message: '该手机号未注册' }, { status: 400 });
    }

    // 检查是否有未过期的验证码
    const existingCode = await db.verificationcode.findFirst({
      where: {
        type: 'reset_password_phone',
        target: phone,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // 如果存在未过期的验证码且在1分钟内创建，则拒绝发送
    if (existingCode &&
      (new Date().getTime() - existingCode.createdAt.getTime()) < 60 * 1000) {
      return NextResponse.json({ 
        message: '请求过于频繁，请稍后再试',
        retryAfter: 60 - Math.floor((new Date().getTime() - existingCode.createdAt.getTime()) / 1000)
      }, { status: 429 });
    }

    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 验证码有效期为10分钟
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 保存验证码记录到数据库
    await db.verificationcode.create({
      data: {
        type: 'reset_password_phone',
        target: phone,
        code,
        expiresAt,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // TODO: 发送短信逻辑
    console.log('向手机号', phone, '发送重置密码验证码:', code);

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的手机'
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('发送验证码错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });
    
    return NextResponse.json({ 
      message: '发送验证码失败',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
} 