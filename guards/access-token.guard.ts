import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseTokenGuard, IRequestWithUser } from './base-token.guard';
import {
  JwtTokensService,
  TokensTypes,
} from '../jwt-tokens/jwt-tokens.service';
import { UserQueryRepository } from '../src/user/repositories/user.query-repository';

@Injectable()
export class AccessTokenGuard extends BaseTokenGuard implements CanActivate {
  constructor(
    protected readonly tokensService: JwtTokensService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {
    super(tokensService, userQueryRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: IRequestWithUser = context.switchToHttp().getRequest();

    const accessToken: string = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException('You need to provide access token');
    }

    const [bearer, accessTokenWithoutBearer] = accessToken.split(' ');

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid access token. Not found "Bearer" in authorization headers',
      );
    }

    await this.verifyTokenAndAddUserToRequest(req, {
      token: accessTokenWithoutBearer,
      tokenType: TokensTypes.ACCESS_TOKEN,
    });

    return true;
  }
}
