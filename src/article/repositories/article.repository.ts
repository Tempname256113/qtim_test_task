import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { ArticleQueryRepository } from './article.query-repository';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { ArticleSchema } from '../dtos/article.schema';

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articlesRepository: Repository<ArticleEntity>,
    private readonly articlesQueryRepository: ArticleQueryRepository,
  ) {}

  async createArticle(
    dto: CreateArticleDto & { authorId: number },
  ): Promise<ArticleSchema> {
    const articleInsertResult = await this.articlesRepository.insert({
      title: dto.title,
      description: dto.description,
      authorId: dto.authorId,
      publishedAt: new Date().toISOString(),
    });

    const createdArticleId = articleInsertResult.identifiers[0].id;

    return this.articlesQueryRepository.getArticleById(createdArticleId);
  }

  async updateArticle(
    articleId: number,
    dto: UpdateArticleDto,
  ): Promise<ArticleSchema> {
    await this.articlesRepository.update(articleId, dto);

    return this.articlesQueryRepository.getArticleById(articleId);
  }
}
