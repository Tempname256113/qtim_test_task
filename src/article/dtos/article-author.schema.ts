import { ApiProperty } from '@nestjs/swagger';

export class ArticleAuthorSchema {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'tempname256113',
  })
  username: string;
}
