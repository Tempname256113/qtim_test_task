import { ArticleEntity } from '../../entities/article.entity';
import { GetArticlesDto } from '../../dtos/get-articles.dto';

export const articleQueryRepositoryMock = (
  storage: Partial<ArticleEntity>[],
) => {
  return () => ({
    getArticleById: jest.fn().mockImplementation((articleId: number) => {
      return storage.find((article) => article.id === articleId);
    }),

    getArticles: jest
      .fn()
      .mockImplementation((dto: Partial<GetArticlesDto>) => {
        const paginatedArticles = (
          page: number,
          pageSize: number,
        ): Partial<ArticleEntity>[] => {
          const startIndex = (page - 1) * pageSize;

          return storage.slice(startIndex, startIndex + pageSize);
        };

        return {
          articles: paginatedArticles(dto.page, dto.pageSize),
          total: storage.length,
          page: dto.page,
          pageSize: dto.pageSize,
        };
      }),
  });
};
