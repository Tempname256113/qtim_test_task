import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUsecase } from './usecases/register-user.usecase';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/user.query-repository';
import { AuthController } from './controllers/auth.controller';
import { LoginUserUsecase } from './usecases/login-user.usecase';

const usecases = [RegisterUserUsecase, LoginUserUsecase];

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), CqrsModule],
  controllers: [AuthController],
  providers: [UserRepository, UserQueryRepository, ...usecases],
  exports: [UserQueryRepository],
})
export class UserModule {}
