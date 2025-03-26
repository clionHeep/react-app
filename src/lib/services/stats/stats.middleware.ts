import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { StatsService } from './stats.service';

@Injectable()
export class StatsMiddleware implements NestMiddleware {
  constructor(private readonly statsService: StatsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 忽略对静态资源的请求
    if (!req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // 可选：根据需求忽略某些路径
      if (!req.url.startsWith('/stats')) {  // 避免统计API自身调用
        await this.statsService.recordVisit();
      }
    }
    next();
  }
} 