import { UpdateArticleDto } from '../dtos/update-article.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArticleSchema } from '../dtos/article.schema';
import { ArticleRepository } from '../repositories/article.repository';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  cantEditArticleErrDesc,
  notFoundArticleByIdErrDesc,
} from './constants';

export class UpdateArticleCommand {
  constructor(
    public articleId: number,
    public userId: number,
    public dto: UpdateArticleDto,
  ) {}
}

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleUsecase
  implements ICommandHandler<UpdateArticleCommand, ArticleSchema>
{
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryRepository: ArticleQueryRepository,
  ) {}

  async execute({
    articleId,
    userId,
    dto: command,
  }: UpdateArticleCommand): Promise<ArticleSchema> {
    const foundArticleById =
      await this.articleQueryRepository.getArticleById(articleId);

    if (!foundArticleById) {
      throw new NotFoundException(notFoundArticleByIdErrDesc);
    }

    if (foundArticleById.author.id !== userId) {
      throw new ForbiddenException(cantEditArticleErrDesc);
    }

    return this.articleRepository.updateArticle(articleId, command);
  }
}
