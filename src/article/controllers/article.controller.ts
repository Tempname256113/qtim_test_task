import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { User } from '../../decorators/user.decorator';
import { UserEntity } from '../../user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ArticleSchema } from '../dtos/article.schema';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateArticleCommand } from '../usecases/create-article.usecase';
import { GetArticlesDto } from '../dtos/get-articles.dto';
import { GetArticlesSchema } from '../dtos/get-articles.schema';
import { GetArticlesQuery } from '../usecases/get-articles.usecase';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import {
  cantDeleteArticleErrDesc,
  cantEditArticleErrDesc,
  notFoundArticleByIdErrDesc,
} from '../usecases/constants';
import { accessTokenIsNotValidErrDesc } from '../../common/constants';
import { UpdateArticleCommand } from '../usecases/update-article.usecase';
import { DeleteArticleCommand } from '../usecases/delete-article.usecase';

const ProtectedEndpoint = (apiOperation: string, httpStatus: HttpStatus) => {
  return applyDecorators(
    ApiOperation({
      summary: apiOperation,
    }),
    UseGuards(AccessTokenGuard),
    ApiUnauthorizedResponse({
      description: accessTokenIsNotValidErrDesc,
    }),
    ApiBearerAuth(),
    HttpCode(httpStatus),
  );
};

@Controller('/article')
@ApiTags('article')
export class ArticleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ProtectedEndpoint('Create new article', HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Article was successful created',
    type: ArticleSchema,
  })
  async createArticle(
    @Body() dto: CreateArticleDto,
    @User() user: UserEntity,
  ): Promise<ArticleSchema> {
    return this.commandBus.execute(
      new CreateArticleCommand({
        ...dto,
        authorId: user.id,
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get articles' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetArticlesSchema,
  })
  async getArticles(@Query() dto: GetArticlesDto): Promise<GetArticlesSchema> {
    return this.queryBus.execute(new GetArticlesQuery(dto));
  }

  @Patch('/:articleId')
  @ProtectedEndpoint('Update article', HttpStatus.OK)
  @ApiOkResponse({
    description: 'Article was successful updated',
    type: ArticleSchema,
  })
  @ApiNotFoundResponse({
    description: notFoundArticleByIdErrDesc,
  })
  @ApiForbiddenResponse({
    description: cantEditArticleErrDesc,
  })
  async updateArticle(
    @Param('articleId') articleId: number,
    @Body() dto: UpdateArticleDto,
    @User() user: UserEntity,
  ): Promise<ArticleSchema> {
    return this.commandBus.execute(
      new UpdateArticleCommand(articleId, user.id, dto),
    );
  }

  @Delete('/:articleId')
  @ProtectedEndpoint('Delete article', HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Article was successful deleted' })
  @ApiNotFoundResponse({
    description: notFoundArticleByIdErrDesc,
  })
  @ApiForbiddenResponse({
    description: cantDeleteArticleErrDesc,
  })
  async deleteArticle(
    @Param('articleId') articleId: number,
    @User() user: UserEntity,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteArticleCommand(articleId, user.id));
  }
}
