import { NextResponse } from "next/server";
import { db } from "@/db";

interface PrismaError extends Error {
  meta?: unknown;
}

function isPrismaError(error: unknown): error is PrismaError {
  return error instanceof Error && "meta" in error;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ message: "邮箱不能为空" }, { status: 400 });
    }
    
    const user = await db.user.findFirst({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: "该邮箱未注册" }, { status: 400 });
    }

    const existingCode = await db.verificationcode.findFirst({
      where: {
        type: "reset_password_email",
        target: email,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingCode && (new Date().getTime() - existingCode.createdAt.getTime()) < 60 * 1000) {
      return NextResponse.json({
        message: "请求过于频繁，请稍后再试",
        retryAfter: 60 - Math.floor((new Date().getTime() - existingCode.createdAt.getTime()) / 1000)
      }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.verificationcode.create({
      data: {
        type: "reset_password_email",
        target: email,
        code,
        expiresAt,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log("向邮箱", email, "发送重置密码验证码:", code);

    return NextResponse.json({
      success: true,
      message: "验证码已发送到您的邮箱"
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("发送验证码错误:", {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : "非Prisma错误"
    });
    
    return NextResponse.json({
      message: "发送验证码失败",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined
    }, { status: 500 });
  }
}
