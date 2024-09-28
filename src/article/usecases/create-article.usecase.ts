import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArticleSchema } from '../dtos/article.schema';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { ArticleRepository } from '../repositories/article.repository';

export class CreateArticleCommand {
  constructor(public data: CreateArticleDto & { authorId: number }) {}
}

@CommandHandler(CreateArticleCommand)
export class CreateArticleUsecase
  implements ICommandHandler<CreateArticleCommand, ArticleSchema>
{
  constructor(private readonly articleRepository: ArticleRepository) {}

  async execute({
    data: command,
  }: CreateArticleCommand): Promise<ArticleSchema> {
    return this.articleRepository.createArticle(command);
  }
}
