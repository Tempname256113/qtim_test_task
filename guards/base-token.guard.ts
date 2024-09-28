import {
  IJwtTokenPayload,
  JwtTokensService,
} from '../jwt-tokens/jwt-tokens.service';
import { Request } from 'express';
import { UserQueryRepository } from '../src/user/repositories/user.query-repository';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../src/user/entities/user.entity';

export interface IRequestWithUser extends Request {
  local: { user: UserEntity };
}

export class BaseTokenGuard {
  constructor(
    protected readonly tokensService: JwtTokensService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {}

  async verifyTokenAndGetPayload(
    token: string,
    tokenType: 'access' | 'refresh',
  ): Promise<IJwtTokenPayload> {
    if (!token) {
      throw new UnauthorizedException('You need to provide token');
    }

    const tokenPayload: IJwtTokenPayload | null =
      tokenType === 'access'
        ? await this.tokensService.verifyAccessToken(token)
        : await this.tokensService.verifyRefreshToken(token);

    if (!token) {
      throw new UnauthorizedException('Invalid token or expired');
    }

    return tokenPayload;
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const foundUser =
      await this.userQueryRepository.getUserByUsername(username);

    if (!foundUser) {
      throw new UnauthorizedException('Not found user with provided token');
    }

    return foundUser;
  }

  addUserToRequest(req: IRequestWithUser, user: UserEntity) {
    req.local = {
      user,
    };
  }
}
