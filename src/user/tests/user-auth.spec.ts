import { UserRepository } from '../repositories/user.repository';
import { UserQueryRepository } from '../repositories/user.query-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { RegisterUserUsecase } from '../usecases/register-user.usecase';
import { LoginUserUsecase } from '../usecases/login-user.usecase';
import { JwtTokensModule } from '../../jwt-tokens/jwt-tokens.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../config/app.config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ITokensPairSchema } from '../../jwt-tokens/jwt-tokens.service';
import { userRepositoryMock } from './mocks/user.repository.mock';
import { userQueryRepositoryMock } from './mocks/user.query-repository.mock';

describe('user auth logic tests', () => {
  let registerUserUsecase: RegisterUserUsecase;
  let loginUserUsecase: LoginUserUsecase;

  const userDtoWithoutRegister: RegisterUserDto | LoginUserDto = {
    username: 'name',
    password: 'pass',
  };
  const userDtoForRegister: RegisterUserDto | LoginUserDto = {
    username: 'name2',
    password: 'pass2',
  };

  const registeredUsers: Partial<UserEntity>[] = [userDtoWithoutRegister];

  beforeAll(async () => {
    const userModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        JwtTokensModule,
      ],
      providers: [
        {
          provide: UserRepository,
          useFactory: userRepositoryMock(registeredUsers),
        },
        {
          provide: UserQueryRepository,
          useFactory: userQueryRepositoryMock(registeredUsers),
        },
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: () => {},
        },
        RegisterUserUsecase,
        LoginUserUsecase,
      ],
    }).compile();

    registerUserUsecase =
      userModule.get<RegisterUserUsecase>(RegisterUserUsecase);

    loginUserUsecase = userModule.get<LoginUserUsecase>(LoginUserUsecase);
  });

  describe('register user usecase tests', () => {
    afterAll(() => {
      registeredUsers.pop(); // удаляется созданный юзер потому что в тестах
      // с логином юзера регистрируется юзер с этим именем еще раз
    });

    it('should throw error because user with provided username already exists', async () => {
      await expect(
        registerUserUsecase.execute({ data: userDtoWithoutRegister }),
      ).rejects.toThrow(ConflictException);
    });

    it('should success register user', async () => {
      await registerUserUsecase.execute({
        data: userDtoForRegister,
      });

      const newCreatedUser = registeredUsers.find(
        (user) => user.username === userDtoForRegister.username,
      );

      expect(newCreatedUser).toEqual({
        username: userDtoForRegister.username,
        password: expect.any(String),
      });
    });
  });

  describe('login user usecase tests', () => {
    it('should throw error because password is not encrypted', async () => {
      await expect(
        loginUserUsecase.execute({
          data: userDtoWithoutRegister,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error because user with provided username is not found', async () => {
      await expect(
        loginUserUsecase.execute({
          data: {
            username: 'some random name',
            password: 'pass',
          },
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should success login user', async () => {
      await registerUserUsecase.execute({
        data: userDtoForRegister,
      });

      const tokensPair: ITokensPairSchema = await loginUserUsecase.execute({
        data: userDtoForRegister,
      });

      expect(tokensPair).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      } as ITokensPairSchema);
    });
  });
});
