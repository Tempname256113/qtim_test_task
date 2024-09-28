import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { Repository } from 'typeorm';
import { ArticleSchema } from '../dtos/article.schema';
import { GetArticlesDto } from '../dtos/get-articles.dto';
import { GetArticlesSchema } from '../dtos/get-articles.schema';

@Injectable()
export class ArticleQueryRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articlesRepository: Repository<ArticleEntity>,
  ) {}

  private mapArticleToSchema(articleWithAuthor: ArticleEntity): ArticleSchema {
    return {
      id: articleWithAuthor.id,
      title: articleWithAuthor.title,
      description: articleWithAuthor.description,
      publishedAt: articleWithAuthor.publishedAt,
      createdAt: articleWithAuthor.createdAt,
      updatedAt: articleWithAuthor.updatedAt,
      author: {
        id: articleWithAuthor.author.id,
        username: articleWithAuthor.author.username,
      },
    };
  }

  async getArticleById(articleId: number): Promise<ArticleSchema> {
    const foundArticle = await this.articlesRepository.findOne({
      relations: {
        author: true,
      },
      where: {
        id: articleId,
      },
    });

    return this.mapArticleToSchema(foundArticle);
  }

  async getArticles(dto: GetArticlesDto): Promise<GetArticlesSchema> {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.author', 'user');

    if (dto.author) {
      queryBuilder.where('user.username = :author', { author: dto.author });
    }

    if (dto.publishedAt) {
      // DATE() обрезает timestamp до YYYY-MM-DD убирая время и оставляя только дату
      queryBuilder.andWhere('DATE(article."publishedAt") = :publishedAt', {
        publishedAt: dto.publishedAt,
      });
    }

    queryBuilder.skip((dto.page - 1) * dto.pageSize).take(dto.pageSize);

    const [foundArticles, totalArticles] = await queryBuilder.getManyAndCount();

    return {
      articles: foundArticles.map((article) =>
        this.mapArticleToSchema(article),
      ),
      total: totalArticles,
      page: dto.page,
      pageSize: dto.pageSize,
    };
  }
}
