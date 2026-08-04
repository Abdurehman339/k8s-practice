import { SetMetadata } from '@nestjs/common';
import { AppConfig } from 'src/config';

export const Roles = (...roles: string[]) => {
  return SetMetadata(AppConfig.user.roles_key, roles);
};
