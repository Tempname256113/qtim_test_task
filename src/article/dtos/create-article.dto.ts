import { NotNullableString } from '../../decorators/not-nullable-string.decorator';

export class CreateArticleDto {
  @NotNullableString('some title')
  title: string;

  @NotNullableString('some description')
  description: string;
}
