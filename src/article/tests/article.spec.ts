import { Test, TestingModule } from '@nestjs/testing';
import { CreateArticleUsecase } from '../usecases/create-article.usecase';
import { GetArticlesUsecase } from '../usecases/get-articles.usecase';
import { UpdateArticleUsecase } from '../usecases/update-article.usecase';
import { DeleteArticleUsecase } from '../usecases/delete-article.usecase';
import { ArticleRepository } from '../repositories/article.repository';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { ArticleCacheRepository } from '../repositories/article.cache-repository';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../config/app.config';
import { JwtTokensModule } from '../../jwt-tokens/jwt-tokens.module';
import { ArticleEntity } from '../entities/article.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { articleRepositoryMock } from './mocks/article.repository.mock';
import { articleQueryRepositoryMock } from './mocks/article.query-repository.mock';
import { articleCacheRepositoryMock } from './mocks/article.cache-repository.mock';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { UpdateArticleDto } from '../dtos/update-article.dto';

describe('article crud tests', () => {
  let createArticleUsecase: CreateArticleUsecase;
  let getArticlesUsecase: GetArticlesUsecase;
  let updateArticleUsecase: UpdateArticleUsecase;
  let deleteArticleUsecase: DeleteArticleUsecase;

  const createdArticles: Partial<ArticleEntity>[] = [];

  beforeAll(async () => {
    const articleModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        JwtTokensModule,
      ],
      providers: [
        CreateArticleUsecase,
        GetArticlesUsecase,
        UpdateArticleUsecase,
        DeleteArticleUsecase,
        {
          provide: ArticleRepository,
          useFactory: articleRepositoryMock(createdArticles),
        },
        {
          provide: ArticleQueryRepository,
          useFactory: articleQueryRepositoryMock(createdArticles),
        },
        {
          provide: getRepositoryToken(ArticleEntity),
          useFactory: () => {},
        },
        {
          provide: ArticleCacheRepository,
          useFactory: articleCacheRepositoryMock,
        },
      ],
    }).compile();

    createArticleUsecase =
      articleModule.get<CreateArticleUsecase>(CreateArticleUsecase);

    getArticlesUsecase =
      articleModule.get<GetArticlesUsecase>(GetArticlesUsecase);

    updateArticleUsecase =
      articleModule.get<UpdateArticleUsecase>(UpdateArticleUsecase);

    deleteArticleUsecase =
      articleModule.get<DeleteArticleUsecase>(DeleteArticleUsecase);
  });

  const createArticleDto: CreateArticleDto & { authorId: number } = {
    title: 'title',
    description: 'desc',
    authorId: 1,
  };

  const updateArticleDto: UpdateArticleDto = {
    title: 'updated title',
    description: 'updated desc',
  };

  it('should create new article', async () => {
    const newArticle = await createArticleUsecase.execute({
      data: createArticleDto,
    });

    expect(newArticle).toEqual({
      ...createArticleDto,
      id: expect.any(Number),
      author: {
        id: createArticleDto.authorId,
      },
      publishedAt: expect.any(String),
    });
  });

  it('should return article', async () => {
    const articles = await getArticlesUsecase.execute({ data: {} });

    expect(articles).toEqual({
      articles: createdArticles.slice(0, 10),
      total: createdArticles.length,
      page: 1,
      pageSize: 10,
    });
  });

  it('should update article', async () => {
    const updatedArticle = await updateArticleUsecase.execute({
      articleId: createdArticles[0].id,
      userId: createdArticles[0].authorId,
      dto: updateArticleDto,
    });

    expect(updatedArticle).toEqual({
      ...createdArticles[0],
      ...updateArticleDto,
    });
  });

  it('should delete article', async () => {
    const articleId = createdArticles[0].id;

    await deleteArticleUsecase.execute({
      articleId: articleId,
      userId: createdArticles[0].authorId,
    });

    const foundDeletedArticle = createdArticles.find(
      (article) => article.id === articleId,
    );

    expect(foundDeletedArticle).toBeUndefined();
  });
});
