import { EOTP } from '@prisma/client';

export type TSendgridEmail = {
  email: string;
  name: string;
  subject: string;
  text: string;
  type: EOTP;
  code: string;
};
