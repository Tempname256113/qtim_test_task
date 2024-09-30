import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { GetArticlesDto } from '../dtos/get-articles.dto';
import { GetArticlesSchema } from '../dtos/get-articles.schema';

@Injectable()
export class ArticleCacheRepository {
  private readonly tenMinutesInSeconds: number;
  private readonly prefix: string;

  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {
    this.tenMinutesInSeconds = 60 * 10;
    this.prefix = 'articles';
  }

  private getCacheKey(filters: Partial<GetArticlesDto>) {
    return `${this.prefix}:${JSON.stringify(filters)}`;
  }

  async cacheArticles(
    filters: Partial<GetArticlesDto>,
    dto: GetArticlesSchema,
  ): Promise<void> {
    const cacheKey = this.getCacheKey(filters);

    await this.redisClient.set(
      cacheKey,
      JSON.stringify(dto),
      'EX',
      this.tenMinutesInSeconds,
    );
  }

  async getCachedArticles(
    filters: Partial<GetArticlesDto>,
  ): Promise<GetArticlesSchema> {
    const cacheKey = this.getCacheKey(filters);

    return this.redisClient.get(cacheKey).then((jsonString) => {
      return JSON.parse(jsonString);
    });
  }

  async deleteAllArticles() {
    const stream = this.redisClient.scanStream({
      match: `${this.prefix}:*`,
      count: 100,
    });

    const pipeline = this.redisClient.pipeline();

    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        keys.forEach((key) => {
          pipeline.del(key);
        });
      }
    });

    await new Promise((resolve, reject) => {
      stream.on('end', () => {
        pipeline
          .exec()
          .then(() => resolve('ok'))
          .catch((error) => reject(error));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
