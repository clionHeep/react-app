import { db } from '@/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from 'redis';
import { JsonResponse, createErrorResponse, createServerErrorResponse, ApiStatus } from '@/utils/api-response';
import { UserRole } from '@/types/db';

// Redis客户端
let redisClient: ReturnType<typeof createClient> | null = null;

// 初始化Redis客户端
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    redisClient.on('error', (err) => console.error('Redis错误:', err));
    await redisClient.connect();
  }
  return redisClient;
}

// Token前缀和过期时间
const TOKEN_PREFIX = 'token:refresh:';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7天，单位为秒

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
    const { username, password } = body;

    // 添加调试日志
    console.log('尝试登录用户:', username);
    console.log('提交的密码长度:', password?.length);

    // 首先只查询用户基本信息
    const user = await db.user.findUnique({
      where: { username }
    });

    console.log('查询到用户:', user ? `ID: ${user.id}` : '未找到');

    if (!user) {
      console.log('认证失败: 用户不存在');
      return createErrorResponse('用户不存在', ApiStatus.UNAUTHORIZED);
    }

    console.log('数据库中的密码(加密):', user.password?.substring(0, 10) + '...');

    // 使用bcrypt比较密码而不是直接比较
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('密码比较结果:', passwordMatch ? '匹配' : '不匹配');

    if (!passwordMatch) {
      console.log('认证失败: 密码错误');
      return createErrorResponse('密码错误', ApiStatus.UNAUTHORIZED);
    }

    console.log('密码验证通过，正在生成令牌');

    // 查询用户的角色
    const userRoles = await db.userrole.findMany({
      where: { userId: user.id },
      include: { role: true }
    }) as unknown as UserRole[];

    // 生成JWT令牌
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

    // 将刷新令牌存储到Redis
    try {
      const redis = await getRedisClient();
      const key = `${TOKEN_PREFIX}${user.id}`;

      // 保存用户ID和刷新令牌的映射
      await redis.set(key, refreshToken, { EX: TOKEN_EXPIRY });

      // 保存刷新令牌和用户ID的反向映射，用于查询
      await redis.set(refreshToken, user.id.toString(), { EX: TOKEN_EXPIRY });

      console.log('刷新令牌已存储到Redis');

      // 更新用户最后登录时间
      await db.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      });

    } catch (redisError) {
      console.error('Redis令牌存储失败:', redisError);
      // 即使Redis存储失败，也继续登录流程，只是记录错误
    }

    // 准备用户角色数据
    const roles = userRoles.map((ur: UserRole) => ur.role.name);

    // 返回简化的用户信息和令牌
    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: roles.join(',') || 'user'
      },
      accessToken,
      refreshToken
    };

    return JsonResponse(responseData, '登录成功');
  } catch (error: unknown) {
    // 添加详细错误日志
    const err = error as Error;
    console.error('登录详细错误:', {
      message: err.message,
      stack: err.stack,
      prismaError: isPrismaError(error) ? (error as { meta: unknown }).meta : '非Prisma错误'
    });

    return createServerErrorResponse(err, '登录失败');
  }
}
