import { ArticleEntity } from '../../entities/article.entity';
import { CreateArticleDto } from '../../dtos/create-article.dto';
import { UpdateArticleDto } from '../../dtos/update-article.dto';
import { generatePseudoRandomNumber } from '../../../common/generate-pseudo-random-number';

export const articleRepositoryMock = (storage: Partial<ArticleEntity>[]) => {
  return () => ({
    createArticle: jest
      .fn()
      .mockImplementation((dto: CreateArticleDto & { authorId: number }) => {
        const newArticle: Partial<ArticleEntity & { author: any }> = {
          id: generatePseudoRandomNumber(),
          title: dto.title,
          description: dto.description,
          authorId: dto.authorId,
          author: {
            id: dto.authorId,
          },
          publishedAt: new Date().toISOString(),
        };

        storage.push(newArticle);

        return newArticle;
      }),

    updateArticle: jest
      .fn()
      .mockImplementation((articleId: number, dto: UpdateArticleDto) => {
        const foundArticle = storage.find(
          (article) => article.id === articleId,
        );

        foundArticle.title = dto.title ? dto.title : foundArticle.title;
        foundArticle.description = dto.description
          ? dto.description
          : foundArticle.description;

        return foundArticle;
      }),

    deleteArticle: jest.fn().mockImplementation((articleId: number) => {
      const articleIndexToDelete = storage.findIndex(
        (article) => article.id === articleId,
      );

      if (articleIndexToDelete !== -1) {
        storage.splice(articleIndexToDelete, 1);
      }
    }),
  });
};
