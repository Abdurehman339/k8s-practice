import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { EOTP, User } from '@prisma/client';
import { AppConfig } from 'src/config';
import { TDecodeReturn, TSigninTokenPayload } from './types';
import { readFileSync } from 'fs';
import * as path from 'path';
import { GlobalCacheService } from '../global-cache/cache.service';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class TokenService {
  private public_key: string;

  constructor(
    private readonly _jwt: JwtService,
    private readonly _cache: GlobalCacheService,
  ) {
    this.public_key = readFileSync(
      path.resolve(__dirname, '../../../keys/public_key.pem'),
      'utf8',
    );
  }

  async generate(user: Partial<User>, type: EOTP) {
    //  const otp =  Utils.randomOTP();
    const key = AppConfig.GetOTPCacheKey(user.email, type);
    await this._cache.set(key, '0000', 1800);

    return '0000';
  }

  async validate(user: Partial<User>, type: EOTP) {
    const key = AppConfig.GetOTPCacheKey(user.email, type);
    return await this._cache.get<string>(key);
  }

  async delete(user: Partial<User>, type: EOTP) {
    const key = AppConfig.GetOTPCacheKey(user.email, type);
    await this._cache.clear(key);
  }

  async signAsync(
    payload: TSigninTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return await this._jwt.signAsync(payload, {
      expiresIn: '5h',
      ...options,
    });
  }

  async cache(user: Partial<User>, ttl?: number): Promise<void> {
    const key = AppConfig.GetAuthKey(user.id);
    const FIVE_DAYS = 60 * 60 * 24 * 5;
    await this._cache.set(key, user, ttl || FIVE_DAYS); // 432000 seconds = 5 days
  }

  async clear_cache(user: Partial<User>): Promise<void> {
    const key = AppConfig.GetAuthKey(user.id);

    const forgotPasswordOTPCacheKey = AppConfig.GetOTPCacheKey(
      user.email,
      EOTP.Forgot_Password,
    );
    await this._cache.clear_multiple([key, forgotPasswordOTPCacheKey]);
  }

  async setTemporaryFlag(email: any, type: EOTP): Promise<void> {
    const key = `${type}:${email}.verified`;
    await this._cache.set(key, 'true', 60 * 30); // 5-minute TTL
  }

  async isVerified(email: any, type: EOTP): Promise<boolean> {
    const key = `${type}:${email}.verified`;
    return await this._cache.get<boolean>(key);
  }

  async clearTemporaryFlag(email: any, type: EOTP): Promise<void> | never {
    const key = `${type}:${email}.verified`;
    await this._cache.clear(key);
  }

  async hash(password?: string, rounds: number = 10) {
    if (!password) return;
    const salt = await genSalt(rounds);
    return await hash(password, salt);
  }

  generateAccessToken(payload: any): string {
    return this._jwt.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: any): string {
    const expiresIn = 60 * 60 * 24 * 7; // 7 days

    const token = this._jwt.sign(payload, {
      algorithm: 'RS256',
      expiresIn: `${expiresIn}s`,
    });

    return token;
  }

  async is_valid_password(pass: string, original: string) {
    return await compare(pass, original);
  }

  decode(token?: string) {
    return this._jwt.decode(token);
  }

  verify(token: string, key?: string): TDecodeReturn {
    return this._jwt.verify(token, {
      secret: key || this.public_key,
      algorithms: ['RS256'],
    });
  }

  get_authorization_token(headers: IncomingHttpHeaders): string | null {
    if (!headers.authorization) return null;

    const [bearer, token] = headers.authorization.split(' ');
    return bearer === 'Bearer' && token ? token : null;
  }

  get_x_refresh_token(headers: IncomingHttpHeaders): string | null {
    const refresh = headers['x-refresh-token'];
    return typeof refresh === 'string' ? refresh : null;
  }
}
