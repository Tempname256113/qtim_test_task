import { ArticleAuthorSchema } from './article-author.schema';
import { ApiProperty } from '@nestjs/swagger';

export class ArticleSchema {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'some title',
  })
  title: string;

  @ApiProperty({
    example: 'some description',
  })
  description: string;

  @ApiProperty({
    example: '2024-09-28T17:56:05.417Z',
  })
  publishedAt: string;

  @ApiProperty({
    example: '2024-09-28T17:56:05.417Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-09-28T17:56:05.417Z',
  })
  updatedAt: string;

  @ApiProperty()
  author: ArticleAuthorSchema;
}
