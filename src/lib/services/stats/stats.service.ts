import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StatsService {
  private readonly TOTAL_VISITS_KEY = 'stats:total_visits';
  private readonly DAILY_VISITS_PREFIX = 'stats:daily_visits:';

  constructor(private readonly redisService: RedisService) {}

  // 记录新的访问
  async recordVisit() {
    const today = this.getDateKey();
    const dailyKey = `${this.DAILY_VISITS_PREFIX}${today}`;

    // 增加总访问量
    await this.redisService.incr(this.TOTAL_VISITS_KEY);
    
    // 增加当日访问量
    await this.redisService.incr(dailyKey);

    // 为每日访问量设置24小时过期时间（可选，用于自动清理）
    const ttl = await this.redisService.exists(dailyKey);
    if (ttl === 0) {
      // 设置过期时间为2天(确保数据保留一段时间)
      await this.redisService.getClient().expire(dailyKey, 60 * 60 * 24 * 2);
    }
  }

  // 获取总访问量
  async getTotalVisits(): Promise<number> {
    const total = await this.redisService.get(this.TOTAL_VISITS_KEY);
    return total ? parseInt(total, 10) : 0;
  }

  // 获取今日访问量
  async getTodayVisits(): Promise<number> {
    const today = this.getDateKey();
    const visits = await this.redisService.get(`${this.DAILY_VISITS_PREFIX}${today}`);
    return visits ? parseInt(visits, 10) : 0;
  }

  // 获取指定日期的访问量
  async getDailyVisits(date: string): Promise<number> {
    const visits = await this.redisService.get(`${this.DAILY_VISITS_PREFIX}${date}`);
    return visits ? parseInt(visits, 10) : 0;
  }

  // 获取最近n天的访问量
  async getRecentVisits(days: number = 7): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = this.formatDate(date);
      const visits = await this.getDailyVisits(dateKey);
      result[dateKey] = visits;
    }
    
    return result;
  }

  // 获取当前日期作为键
  private getDateKey(): string {
    return this.formatDate(new Date());
  }

  // 格式化日期为YYYY-MM-DD
  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }
} 