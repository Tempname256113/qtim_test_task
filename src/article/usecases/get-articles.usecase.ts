import { GetArticlesDto } from '../dtos/get-articles.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { GetArticlesSchema } from '../dtos/get-articles.schema';
import { ArticleCacheRepository } from '../repositories/article.cache-repository';

export class GetArticlesQuery {
  constructor(public data: GetArticlesDto) {}
}

@QueryHandler(GetArticlesQuery)
export class GetArticlesUsecase
  implements IQueryHandler<GetArticlesQuery, GetArticlesSchema>
{
  constructor(
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly articleCacheRepository: ArticleCacheRepository,
  ) {}

  async execute({ data: query }: GetArticlesQuery): Promise<GetArticlesSchema> {
    query.page = Number(query.page) ?? 1;
    query.pageSize = Number(query.pageSize) ?? 10;

    const cachedArticles: GetArticlesSchema =
      await this.articleCacheRepository.getCachedArticles(query);

    if (cachedArticles) {
      return cachedArticles;
    }

    const foundArticles: GetArticlesSchema =
      await this.articleQueryRepository.getArticles(query);
    await this.articleCacheRepository.cacheArticles(query, foundArticles);

    return foundArticles;
  }
}
