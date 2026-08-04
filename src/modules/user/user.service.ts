import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TResponse } from 'utils/interfaces/return';
import Utils from 'utils/service';
import { IUserService } from './interface';
import { TokenService } from '../token/token.service';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { TUpdateProfile } from './dto/update';
import { GlobalCacheService } from '../global-cache/cache.service';
import { AppConfig } from 'src/config';
import { HostingerService } from 'src/utils/service/hostinger';
import { TContactUs } from './dto/contact-us';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly _cache: GlobalCacheService,
    private readonly _token: TokenService,
    private readonly _database: DatabaseService,
    private readonly _hostinger: HostingerService,
  ) {}

  async read(user: Partial<User>): Promise<TResponse> {
    return user;
  }

  async update(user_id: string, payload: TUpdateProfile): Promise<TResponse> {
    const cleanedPayload = Utils.clean(payload);

    if (!Object.keys(cleanedPayload).length) {
      return 'Nothing to update';
    }

    let finalPayload: any = cleanedPayload;

    const user = await this._database.user.findUnique({
      where: { id: user_id, deleted_at: null },
      select: {
        password: true,
        id: true,
        profile_image_id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (cleanedPayload.profile_image_id === user.profile_image_id) {
      return 'Nothing to update';
    }

    if (cleanedPayload.profile_image_id) {
      const media = await this._database.media.findFirst({
        where: { id: cleanedPayload.profile_image_id },
        select: { id: true, path: true, cloudfront_path: true },
      });

      if (!media) {
        throw new NotFoundException('profile image not found');
      }

      if (user.profile_image_id === media.id) {
        throw new BadRequestException(
          'Profile image cannot be same as already existing image',
        );
      }

      finalPayload.profile_image_id = cleanedPayload.profile_image_id;
    }

    if (cleanedPayload.old_password) {
      const isOldPasswordCorrect = await this._token.is_valid_password(
        cleanedPayload.old_password,
        user.password,
      );

      if (!isOldPasswordCorrect) {
        throw new BadRequestException('Old password is incorrect');
      }

      const isSamePassword = await this._token.is_valid_password(
        cleanedPayload.password,
        user.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }

      finalPayload.password = await this._token.hash(cleanedPayload.password);
    }

    if (cleanedPayload.location && cleanedPayload.location.length === 2) {
      finalPayload.location = {
        coordinates: cleanedPayload.location,
      };
    }

    delete finalPayload.old_password;

    const updatedUser = await this._database.user.update({
      where: { id: user_id },
      data: finalPayload,
      select: {
        email: true,
        name: true,
        address: true,
        location: true,
        profile_image_id: true,
        phone: true,
      },
    });

    if (updatedUser) {
      await this._cache.update<User>(
        AppConfig.GetAuthKey(user.id),
        updatedUser,
      );
    }

    return 'Profile updated successfully';
  }

  // async contact(payload: TContactUs): Promise<TResponse> {
  //   return await this._hostinger.send_email(payload);
  // }
}
