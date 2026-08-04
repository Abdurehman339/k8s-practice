import { User } from '@prisma/client';
import { TPaginationQuery } from 'utils/dtos/query.dto';
import { TResponse } from 'utils/interfaces/return';

export interface INotificationService {
  get(user: Partial<User>, query: TPaginationQuery): Promise<TResponse>;
  delete(user: Partial<User>, notification_id: string): Promise<TResponse>;
  delete_all(user: Partial<User>): Promise<TResponse>;
}
