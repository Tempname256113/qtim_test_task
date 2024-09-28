import { LoginUserDto } from '../dtos/login-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../repositories/user.query-repository';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ITokensPairSchema,
  JwtTokensService,
} from '../../jwt-tokens/jwt-tokens.service';

export const unauthorizedExceptionDesc = 'Username or password is not valid';

export class LoginUserCommand {
  constructor(public data: LoginUserDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUsecase
  implements ICommandHandler<LoginUserCommand, ITokensPairSchema>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly jwtTokensService: JwtTokensService,
  ) {}

  async execute(command: LoginUserCommand): Promise<ITokensPairSchema> {
    const foundUser = await this.getUser(command);

    return this.jwtTokensService.createTokensPair({
      username: foundUser.username,
      userId: foundUser.id,
    });
  }

  async getUser({ data }: LoginUserCommand) {
    const foundUserByUsername =
      await this.userQueryRepository.getUserByUsername(data.username);

    if (!foundUserByUsername) {
      throw new UnauthorizedException(unauthorizedExceptionDesc);
    }

    const passwordIsCorrect = await bcrypt.compare(
      data.password,
      foundUserByUsername.password,
    );

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(unauthorizedExceptionDesc);
    }

    return foundUserByUsername;
  }
}
