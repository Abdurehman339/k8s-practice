import { TResponse } from 'utils/interfaces/return';
import { User } from '@prisma/client';
import { TUpdateProfile } from '../dto/update';

export interface IUserService {
  update(user_id: string, payload: TUpdateProfile): Promise<TResponse>;
  read(user: Partial<User>, doctor_id: string): Promise<TResponse>;
}
