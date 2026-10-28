import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../domain/auth/enum/role.enum';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTokens(payload: AuthTokenPayload): Promise<AuthTokens> {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'super_secret_jwt_access_key_taxii_2026';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super_secret_jwt_refresh_key_taxii_2026';
    const expiresIn: JwtSignOptions['expiresIn'] =
      this.configService.get<JwtSignOptions['expiresIn']>('JWT_EXPIRES_IN') ||
      '15m';
    const refreshExpiresIn: JwtSignOptions['expiresIn'] =
      this.configService.get<JwtSignOptions['expiresIn']>(
        'JWT_REFRESH_EXPIRES_IN',
      ) || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    return this.jwtService.verifyAsync<AuthTokenPayload>(token, {
      secret: this.configService.get<string>(
        'JWT_SECRET',
        'super_secret_jwt_access_key_taxii_2026',
      ),
    });
  }

  public async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    return this.jwtService.verifyAsync<AuthTokenPayload>(token, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'super_secret_jwt_refresh_key_taxii_2026',
      ),
    });
  }
}
