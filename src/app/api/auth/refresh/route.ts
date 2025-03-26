import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { createClient } from 'redis';
import { JsonResponse, createErrorResponse, createServerErrorResponse, ApiStatus } from '@/utils/api-response';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
}

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

export async function POST(request: NextRequest) {
  try {
    // 解析请求体获取刷新令牌
    const { refreshToken } = await request.json();
    
    console.log('收到刷新令牌请求，令牌部分:', refreshToken?.substring(0, 20) + '...');

    if (!refreshToken) {
      return createErrorResponse('缺少刷新令牌', ApiStatus.BAD_REQUEST);
    }

    // 验证刷新令牌
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as JwtPayload;
      console.log('刷新令牌验证成功，用户ID:', payload.sub);
    } catch (error) {
      console.error('刷新令牌验证失败:', error);
      return createErrorResponse('无效的刷新令牌', ApiStatus.UNAUTHORIZED);
    }

    // 获取用户ID
    const userId = Number(payload.sub);

    // 检查Redis中是否有此刷新令牌的记录
    try {
      const redis = await getRedisClient();
      const storedUserId = await redis.get(refreshToken);
      
      console.log('Redis中存储的用户ID:', storedUserId);
      console.log('当前请求的用户ID:', userId);

      if (!storedUserId || Number(storedUserId) !== userId) {
        return createErrorResponse('刷新令牌已失效', ApiStatus.UNAUTHORIZED);
      }
    } catch (redisError) {
      console.error('Redis查询失败:', redisError);
      // 如果Redis不可用，简单验证用户是否存在
    }

    // 查询用户
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return createErrorResponse('用户不存在', ApiStatus.NOT_FOUND);
    }

    // 生成新的访问令牌和刷新令牌
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

    // 更新Redis中的令牌映射
    try {
      const redis = await getRedisClient();
      
      // 删除旧的刷新令牌
      await redis.del(refreshToken);
      
      // 保存新的映射
      const key = `${TOKEN_PREFIX}${user.id}`;
      await redis.set(key, newRefreshToken, { EX: TOKEN_EXPIRY });
      await redis.set(newRefreshToken, user.id.toString(), { EX: TOKEN_EXPIRY });
      
      console.log('已更新Redis中的令牌');
    } catch (redisError) {
      console.error('Redis更新失败:', redisError);
      // 即使Redis存储失败，也继续流程，只是记录错误
    }

    // 返回新的令牌
    return JsonResponse({
      accessToken,
      refreshToken: newRefreshToken
    }, '令牌已刷新');
  } catch (error) {
    console.error('刷新令牌失败:', error);
    return createServerErrorResponse(error as Error, '刷新令牌失败');
  }
}

