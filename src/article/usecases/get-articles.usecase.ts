import { GetArticlesDto } from '../dtos/get-articles.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { GetArticlesSchema } from '../dtos/get-articles.schema';

export class GetArticlesQuery {
  constructor(public data: GetArticlesDto) {}
}

@QueryHandler(GetArticlesQuery)
export class GetArticlesUsecase
  implements IQueryHandler<GetArticlesQuery, GetArticlesSchema>
{
  constructor(
    private readonly articleQueryRepository: ArticleQueryRepository,
  ) {}

  async execute({ data: query }: GetArticlesQuery): Promise<GetArticlesSchema> {
    query.page = Number(query.page) ?? 1;
    query.pageSize = Number(query.pageSize) ?? 10;

    return this.articleQueryRepository.getArticles(query);
  }
}
