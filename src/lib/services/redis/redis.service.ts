import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: ReturnType<typeof createClient>;

  constructor() {
    // 创建Redis客户端
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => console.error('Redis错误:', err));
    this.client.on('connect', () => console.log('Redis连接成功'));
  }

  async onModuleInit() {
    // 启动时连接Redis
    await this.client.connect();
  }

  async onModuleDestroy() {
    // 关闭连接
    await this.client.disconnect();
  }

  // 获取Redis客户端
  getClient() {
    return this.client;
  }

  // 设置键值对
  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  // 获取值
  async get(key: string) {
    return this.client.get(key);
  }

  // 删除键
  async del(key: string) {
    await this.client.del(key);
  }

  // 增加计数器
  async incr(key: string) {
    return this.client.incr(key);
  }

  // 获取指定模式的所有键
  async keys(pattern: string) {
    return this.client.keys(pattern);
  }

  // 检查键是否存在
  async exists(key: string) {
    return this.client.exists(key);
  }
} 