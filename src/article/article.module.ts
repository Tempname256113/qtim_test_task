import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { ArticleRepository } from './repositories/article.repository';
import { ArticleController } from './controllers/article.controller';
import { ArticleQueryRepository } from './repositories/article.query-repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateArticleUsecase } from './usecases/create-article.usecase';
import { GetArticlesUsecase } from './usecases/get-articles.usecase';

const usecases = [CreateArticleUsecase, GetArticlesUsecase];

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), CqrsModule],
  providers: [ArticleRepository, ArticleQueryRepository, ...usecases],
  controllers: [ArticleController],
})
export class ArticleModule {}
