import {
  IJwtTokenPayload,
  JwtTokensService,
  TokensTypes,
} from '../jwt-tokens/jwt-tokens.service';
import { Request } from 'express';
import { UserQueryRepository } from '../src/user/repositories/user.query-repository';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../src/user/entities/user.entity';

export interface IRequestWithUser extends Request {
  local: { user: UserEntity };
}

export interface ITokenData {
  token: string;
  tokenType: TokensTypes;
}

export class BaseTokenGuard {
  constructor(
    protected readonly tokensService: JwtTokensService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {}

  private async verifyTokenAndGetPayload({
    token,
    tokenType,
  }: ITokenData): Promise<IJwtTokenPayload> {
    if (!token) {
      throw new UnauthorizedException('You need to provide token');
    }

    const tokenPayload: IJwtTokenPayload | null =
      tokenType === TokensTypes.ACCESS_TOKEN
        ? await this.tokensService.verifyAccessToken(token)
        : await this.tokensService.verifyRefreshToken(token);

    if (!token) {
      throw new UnauthorizedException('Invalid token or expired');
    }

    return tokenPayload;
  }

  private async getUserByUsername(username: string): Promise<UserEntity> {
    const foundUser =
      await this.userQueryRepository.getUserByUsername(username);

    if (!foundUser) {
      throw new UnauthorizedException('Not found user with provided token');
    }

    return foundUser;
  }

  async verifyTokenAndAddUserToRequest(
    req: IRequestWithUser,
    tokenData: ITokenData,
  ): Promise<void> {
    const tokenPayload: IJwtTokenPayload =
      await this.verifyTokenAndGetPayload(tokenData);

    const foundUser: UserEntity = await this.getUserByUsername(
      tokenPayload.username,
    );

    req.local = {
      user: foundUser,
    };
  }
}
