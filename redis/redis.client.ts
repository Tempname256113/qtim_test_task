import { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const redisClient: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: (config: ConfigService) => {
    const redisInstance = new Redis({
      host: config.get('REDIS_CONFIG.host'),
      port: config.get('REDIS_CONFIG.port'),
      password: config.get('REDIS_CONFIG.password'),
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [ConfigService],
};
