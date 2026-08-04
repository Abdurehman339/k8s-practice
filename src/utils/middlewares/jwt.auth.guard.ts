import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AppConfig } from 'src/config';
import { DatabaseService } from 'src/database/database.service';
import { GlobalCacheService } from 'src/modules/global-cache/cache.service';
import { TokenService } from 'src/modules/token/token.service';
import { TRequest } from 'utils/interfaces/t-request';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly _cache: GlobalCacheService,
    private readonly _token: TokenService,
    private readonly _database: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: TRequest = context.switchToHttp().getRequest();

    const bearer = this._token.get_authorization_token(request.headers);
    if (!bearer) throw new UnauthorizedException('Invalid token');

    const refresh_token = this._token.get_x_refresh_token(request.headers);

    const token = this._token.verify(bearer);
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    const key = AppConfig.GetAuthKey(token.id);
    let user = await this._cache.get<Partial<User>>(key);

    if (!user) {
      user = await this._database.user.findFirst({
        where: { id: token.id, deleted_at: null },
      });

      if (!user) {
        throw new NotFoundException('User does not exist');
      }
    }

    request.token = bearer;
    request['x-refresh-token'] = refresh_token;
    request.user = Object.assign({}, user, token);

    // deleting user sensitive information
    delete request.user.password;

    return true;
  }
}
