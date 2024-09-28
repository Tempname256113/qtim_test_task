import {
  IJwtTokenPayload,
  JwtTokensService,
} from '../jwt-tokens/jwt-tokens.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserQueryRepository } from '../src/user/repositories/user.query-repository';
import { UserEntity } from '../src/user/entities/user.entity';
import { BaseTokenGuard, IRequestWithUser } from './base-token.guard';

@Injectable()
export class RefreshTokenGuard extends BaseTokenGuard implements CanActivate {
  constructor(
    protected readonly tokensService: JwtTokensService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {
    super(tokensService, userQueryRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: IRequestWithUser = context.switchToHttp().getRequest();

    const refreshToken: string =
      req.cookies?.[JwtTokensService.refreshTokenCookieTitle];

    const refreshTokenPayload: IJwtTokenPayload =
      await this.verifyTokenAndGetPayload(refreshToken, 'refresh');

    const foundUser: UserEntity = await this.getUserByUsername(
      refreshTokenPayload.username,
    );

    this.addUserToRequest(req, foundUser);

    return true;
  }
}
