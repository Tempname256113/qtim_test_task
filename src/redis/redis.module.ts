import { Global, Module } from '@nestjs/common';
import { redisClient } from './redis.client';

@Global()
@Module({
  providers: [redisClient],
  exports: [redisClient],
})
export class RedisModule {}
