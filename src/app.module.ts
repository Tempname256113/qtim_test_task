import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import pgConfig from '../config/pg-config';
import { UserModule } from './user/user.module';
import redisConfig from '../config/redis.config';
import { RedisModule } from '../redis/redis.module';
import appConfig from '../config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig, redisConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('PG_CONFIG.host'),
        port: config.get('PG_CONFIG.port'),
        username: config.get('PG_CONFIG.user'),
        password: config.get('PG_CONFIG.password'),
        database: config.get('PG_CONFIG.dbName'),
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
