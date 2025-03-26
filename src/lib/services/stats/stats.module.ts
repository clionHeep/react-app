import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { RedisModule } from '../redis/redis.module';
import { StatsController } from './stats.controller';

@Module({
  imports: [RedisModule],
  providers: [StatsService],
  exports: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {} 