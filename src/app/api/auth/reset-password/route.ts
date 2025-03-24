import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as bcrypt from 'bcrypt';

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
    const { email, phone, code, newPassword } = body;
    
    // 必须提供邮箱或手机号其中一个
    if (!email && !phone) {
      return NextResponse.json({ message: '请提供邮箱或手机号' }, { status: 400 });
    }
    
    if (!code) {
      return NextResponse.json({ message: '验证码不能为空' }, { status: 400 });
    }
    
    if (!newPassword) {
      return NextResponse.json({ message: '新密码不能为空' }, { status: 400 });
    }
    
    // 查找用户
    const user = await db.user.findFirst({
      where: email ? { email } : { phone }
    });

    if (!user) {
      return NextResponse.json({ message: '用户不存在' }, { status: 400 });
    }
    
    // 验证码验证
    const isCodeValid = await verifyResetPasswordCode(
      email || phone!,
      code,
      email ? 'reset_password_email' : 'reset_password_phone'
    );

    if (!isCodeValid) {
      return NextResponse.json({ message: '验证码无效或已过期' }, { status: 400 });
    }
    
    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('重置密码错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });
    
    return NextResponse.json({ 
      message: '重置密码失败',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

/**
 * 验证重置密码验证码
 * @param target 目标(邮箱或手机号)
 * @param code 验证码
 * @param type 类型(reset_password_email或reset_password_phone)
 * @returns 验证是否成功
 */
async function verifyResetPasswordCode(target: string, code: string, type: string): Promise<boolean> {
  // 查询最近的未使用的验证码记录
  const codeRecord = await db.verificationcode.findFirst({
    where: {
      type,
      target,
      code,
      used: false,
      expiresAt: {
        gt: new Date() // 未过期
      }
    },
    orderBy: {
      createdAt: 'desc' // 最新创建的
    }
  });

  if (!codeRecord) {
    return false;
  }

  // 标记验证码为已使用
  await db.verificationcode.update({
    where: { id: codeRecord.id },
    data: { used: true }
  });

  return true;
} 