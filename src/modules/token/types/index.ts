import { EUserRole } from '@prisma/client';

export type TSigninTokenPayload = {
  id: string;
  role: EUserRole;
};

export type TDecodeReturn = {
  id: string;
  role: EUserRole;
  iat: number;
  exp: number;
};
