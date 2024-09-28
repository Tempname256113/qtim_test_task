import { ArticleSchema } from './article.schema';
import { ApiProperty } from '@nestjs/swagger';

const articleSample = {
  id: 6,
  title: 'some title',
  description: 'some description',
  publishedAt: '2024-09-28T18:24:22.603Z',
  createdAt: '2024-09-28T18:24:22.607Z',
  updatedAt: '2024-09-28T18:24:22.607Z',
  author: {
    id: 1,
    username: 'tempname256113',
  },
};

export class GetArticlesSchema {
  @ApiProperty({
    type: [ArticleSchema],
    example: [{ ...articleSample }, { ...articleSample, id: 7 }],
  })
  articles: ArticleSchema[];

  @ApiProperty({
    example: 50,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  pageSize: number;
}
