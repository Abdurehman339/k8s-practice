import { User } from '@prisma/client';
import { TResponse } from 'utils/interfaces/return';
import { TFile } from '../types';
import { TPaginationQuery } from 'utils/dtos/query.dto';

export interface IMediaService {
  upload(user: Partial<User>, file: TFile): Promise<TResponse>;
  uploads(user: Partial<User>, files: TFile[]): Promise<TResponse>;
  delete(user: Partial<User>, media_id: string): Promise<TResponse>;
  uploads_legacy(user: Partial<User>, files: TFile[]): Promise<TResponse>;
  delete_many(user: Partial<User>, media_ids: string[]): Promise<TResponse>;
  get(user_id: string, query: TPaginationQuery): Promise<TResponse>;
}
