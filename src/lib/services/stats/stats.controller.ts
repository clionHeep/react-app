import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // 获取总访问量
  @Get('total')
  async getTotalVisits() {
    const total = await this.statsService.getTotalVisits();
    return { total };
  }

  // 获取今日访问量
  @Get('today')
  async getTodayVisits() {
    const today = await this.statsService.getTodayVisits();
    return { today };
  }

  // 获取指定日期的访问量，格式：YYYY-MM-DD
  @Get('daily/:date')
  @UseGuards(JwtAuthGuard) // 需要登录权限
  async getDailyVisits(@Param('date') date: string) {
    const visits = await this.statsService.getDailyVisits(date);
    return { date, visits };
  }

  // 获取最近n天的访问量
  @Get('recent/:days')
  @UseGuards(JwtAuthGuard) // 需要登录权限
  async getRecentVisits(@Param('days', ParseIntPipe) days: number) {
    const visits = await this.statsService.getRecentVisits(days);
    return { visits };
  }
} 