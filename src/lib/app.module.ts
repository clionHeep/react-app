import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './services/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from './services/user/user.module';
import { RedisModule } from './services/redis/redis.module';
import { StatsModule } from './services/stats/stats.module';
import { StatsMiddleware } from './services/stats/stats.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    RedisModule,
    StatsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用统计中间件到所有路由
    consumer.apply(StatsMiddleware).forRoutes('*');
  }
}