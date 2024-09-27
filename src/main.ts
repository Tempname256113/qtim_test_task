import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtTokensService } from '../jwt-tokens/jwt-tokens.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Qtim test task api')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addCookieAuth(JwtTokensService.refreshTokenCookieTitle, {
      type: 'http',
      in: 'cookie',
    })
    .build();
  const swagger = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/v1/docs', app, swagger, {
    customSiteTitle: 'qtim test task api',
  });

  const port = 3001;
  await app.listen(port);

  console.log(`app started on: http://localhost:${port}/api/v1`);
}
bootstrap();
