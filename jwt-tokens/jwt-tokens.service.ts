import { Inject, Injectable } from '@nestjs/common';
import appConfig from '../config/app.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { add, getUnixTime } from 'date-fns';
import { Response } from 'express';

export interface IJwtTokenPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
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
    tokenType: 'access' | 'refresh',
  ) {
    const { userId, username } = data;

    const currentDate: Date = new Date();

    // для jwt токенов время нужно предоставлять в секундах, поэтому такое преобразование
    const iat: number = getUnixTime(currentDate);
    const exp: number =
      tokenType === 'access'
        ? this.getAccessTokenExpireTime(currentDate)
        : this.getRefreshTokenExpireTime(currentDate);

    const payload: IJwtTokenPayload = {
      userId,
      username,
      iat,
      exp,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
    });
  }

  async createAccessToken(data: { userId: number; username: string }) {
    return this.createToken(data, 'access');
  }

  async createRefreshToken(data: { userId: number; username: string }) {
    return this.createToken(data, 'refresh');
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
  }): Promise<{ accessToken: string; refreshToken: string }> {
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
    tokenType: 'access' | 'refresh',
  ): Promise<IJwtTokenPayload | null> {
    const secret =
      tokenType === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;

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
    return this.verifyToken(token, 'access');
  }

  async verifyRefreshToken(token: string): Promise<IJwtTokenPayload | null> {
    return this.verifyToken(token, 'refresh');
  }
}
