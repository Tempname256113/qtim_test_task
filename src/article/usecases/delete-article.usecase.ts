import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArticleRepository } from '../repositories/article.repository';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  cantDeleteArticleErrDesc,
  notFoundArticleByIdErrDesc,
} from './constants';

export class DeleteArticleCommand {
  constructor(
    public articleId: number,
    public userId: number,
  ) {}
}

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleUsecase
  implements ICommandHandler<DeleteArticleCommand, void>
{
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryRepository: ArticleQueryRepository,
  ) {}

  async execute({ articleId, userId }: DeleteArticleCommand): Promise<void> {
    const foundArticleById =
      await this.articleQueryRepository.getArticleById(articleId);

    if (!foundArticleById) {
      throw new NotFoundException(notFoundArticleByIdErrDesc);
    }

    if (foundArticleById.author.id !== userId) {
      throw new ForbiddenException(cantDeleteArticleErrDesc);
    }

    await this.articleRepository.deleteArticle(articleId);
  }
}
