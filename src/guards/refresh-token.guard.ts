import {
  JwtTokensService,
  TokensTypes,
} from '../jwt-tokens/jwt-tokens.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserQueryRepository } from '../user/repositories/user.query-repository';
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

    await this.verifyTokenAndAddUserToRequest(req, {
      token: refreshToken,
      tokenType: TokensTypes.REFRESH_TOKEN,
    });

    return true;
  }
}
