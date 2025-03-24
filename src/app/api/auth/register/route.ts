import { db } from '@/db';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createSuccessResponse, createErrorResponse, createServerErrorResponse, ApiStatus } from '@/utils/api-response';

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
    const { username, email, phone, password, name, ...otherData } = body;

    // 验证必填字段
    if (!username || !password) {
      return createErrorResponse('用户名和密码是必填项');
    }

    // 验证用户名是否存在
    const existingUsername = await db.user.findFirst({
      where: { username }
    });

    if (existingUsername) {
      return createErrorResponse('用户名已被注册');
    }

    // 验证邮箱是否存在
    if (email) {
      const existingEmail = await db.user.findFirst({
        where: { email }
      });

      if (existingEmail) {
        return createErrorResponse('邮箱已被注册');
      }
    }

    // 验证手机号是否存在
    if (phone) {
      const existingPhone = await db.user.findFirst({
        where: { phone }
      });

      if (existingPhone) {
        return createErrorResponse('手机号已被注册');
      }
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await db.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        name: name || username,
        status: 'ACTIVE',
        roles: Array.isArray(otherData.roles) ? otherData.roles.join(',') : otherData.roles || 'user',
        ...otherData
      }
    });

    // 为新用户分配默认角色（如果需要）
    // 这里依赖于你的数据库结构，可能需要调整

    // 生成令牌
    const accessToken = jwt.sign(
      { sub: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    // 使用统一的响应格式返回数据
    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles || 'user'
      },
      accessToken,
      refreshToken
    };

    return createSuccessResponse(responseData, '注册成功', ApiStatus.CREATED);
  } catch (error: unknown) {
    // 添加详细错误日志
    const err = error as Error;
    console.error('注册错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });

    return createServerErrorResponse(err, '注册失败');
  }
}
