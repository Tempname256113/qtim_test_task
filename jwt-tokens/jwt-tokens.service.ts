import { Inject, Injectable } from '@nestjs/common';
import appConfig from '../config/app.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { add, getUnixTime } from 'date-fns';
import { Response } from 'express';

export enum TokensTypes {
  ACCESS_TOKEN = 'access',
  REFRESH_TOKEN = 'refresh',
}

export interface IJwtTokenPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ITokensPairSchema {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokensService {
  public static readonly refreshTokenCookieTitle = 'refreshToken';

  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  private readonly getAccessTokenExpireTime: (currentDate: Date) => number;
  private readonly getRefreshTokenExpireTime: (currentDate: Date) => number;

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.config.accessTokenSecret;
    this.refreshTokenSecret = this.config.refreshTokenSecret;

    this.getAccessTokenExpireTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { minutes: 15 }));
    };
    this.getRefreshTokenExpireTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { months: 3 }));
    };
  }

  private async createToken(
    data: { userId: number; username: string },
    tokenType: TokensTypes,
  ) {
    const { userId, username } = data;

    const currentDate: Date = new Date();

    // для jwt токенов время нужно предоставлять в секундах, поэтому такое преобразование
    const iat: number = getUnixTime(currentDate);

    let exp: number;
    let secret: string;

    if (tokenType === TokensTypes.ACCESS_TOKEN) {
      exp = this.getAccessTokenExpireTime(currentDate);
      secret = this.accessTokenSecret;
    } else if (tokenType === TokensTypes.REFRESH_TOKEN) {
      exp = this.getRefreshTokenExpireTime(currentDate);
      secret = this.refreshTokenSecret;
    }

    const payload: IJwtTokenPayload = {
      userId,
      username,
      iat,
      exp,
    };

    return this.jwtService.signAsync(payload, {
      secret,
    });
  }

  async createAccessToken(data: { userId: number; username: string }) {
    return this.createToken(data, TokensTypes.ACCESS_TOKEN);
  }

  async createRefreshToken(data: { userId: number; username: string }) {
    return this.createToken(data, TokensTypes.REFRESH_TOKEN);
  }

  setRefreshTokenInCookie(data: { refreshToken: string; res: Response }): void {
    const { refreshToken, res } = data;

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const expireDate: Date = new Date(
      this.getTokenPayload(refreshToken).exp * 1000,
    );

    res.cookie(JwtTokensService.refreshTokenCookieTitle, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: expireDate,
      sameSite: 'none',
    });
  }

  async createTokensPair(data: {
    userId: number;
    username: string;
  }): Promise<ITokensPairSchema> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(data),
      this.createRefreshToken(data),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getTokenPayload(token: string): IJwtTokenPayload {
    return this.jwtService.decode(token);
  }

  private async verifyToken(
    token: string,
    tokenType: TokensTypes,
  ): Promise<IJwtTokenPayload | null> {
    const secret =
      tokenType === TokensTypes.ACCESS_TOKEN
        ? this.accessTokenSecret
        : this.refreshTokenSecret;

    try {
      const tokenPayload: IJwtTokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret,
          ignoreExpiration: false,
        },
      );

      return tokenPayload;
    } catch (err) {
      return null;
    }
  }

  async verifyAccessToken(token: string): Promise<IJwtTokenPayload | null> {
    return this.verifyToken(token, TokensTypes.ACCESS_TOKEN);
  }

  async verifyRefreshToken(token: string): Promise<IJwtTokenPayload | null> {
    return this.verifyToken(token, TokensTypes.REFRESH_TOKEN);
  }
}
