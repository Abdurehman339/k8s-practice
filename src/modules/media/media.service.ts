import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Media, User } from '@prisma/client';
import { IMediaService } from './interface';
import { TResponse } from 'utils/interfaces/return';
import { S3Service } from './services/s3';
import { TFile, TMediaUploadResult } from './types';
import Utils from 'utils/service';
import { TPaginationQuery } from 'utils/dtos/query.dto';
import { GlobalCacheService } from '../global-cache/cache.service';
import RedisCacheKeys from '../global-cache/keys';

@Injectable()
export class MediaService implements IMediaService {
  constructor(
    private readonly _cache: GlobalCacheService,
    private readonly _database: DatabaseService,
    private readonly _s3: S3Service,
  ) {}

  async upload(user: Partial<User>, file: TFile): Promise<TResponse> {
    if (!file) return 'File not provided';

    const { originalname, buffer, mimetype, encoding, size } = file;

    const { extension, modified_name, type } = this._s3.get_meta(originalname);
    const { cloudfront_path, path } = this._s3.paths(modified_name);

    const result = await this._database.$transaction(async (prisma) => {
      const uploadOnBucket = this._s3.upload(buffer, modified_name, type);
      const uploadOnDatabase = prisma.media.create({
        data: {
          user_id: user.id,
          cloudfront_path,
          path,
          modified_name: modified_name,
          name: originalname,
          resource_type: type,
          mime_type: mimetype || extension,
          size,
          encoding,
        },
        select: {
          id: true,
          name: true,
          resource_type: true,
          cloudfront_path: true,
          path: true,
          size: true,
        },
      });

      const [bucket, media] = await Promise.all([
        uploadOnBucket,
        uploadOnDatabase,
      ]);

      return { bucket, media };
    });

    return result.media;
  }

  async upload_anonymous(file: TFile): Promise<TResponse> {
    if (!file) return 'File not provided';

    const { originalname, buffer, mimetype, encoding, size } = file;

    const { extension, modified_name, type } = this._s3.get_meta(originalname);
    const { cloudfront_path, path } = this._s3.paths(modified_name);

    const uploadOnBucketPromise = this._s3.upload(buffer, modified_name, type);
    const uploadOnDatabasePromise = this._database.media.create({
      data: {
        cloudfront_path,
        path,
        modified_name: modified_name,
        name: originalname,
        resource_type: type,
        mime_type: mimetype || extension,
        size,
        encoding,
      },
      select: {
        id: true,
        name: true,
        resource_type: true,
        cloudfront_path: true,
        path: true,
        size: true,
      },
    });

    const [bucket, media] = await Promise.all([
      uploadOnBucketPromise,
      uploadOnDatabasePromise,
    ]);

    return media;
  }

  async uploads_legacy(
    user: Partial<User>,
    files: TFile[],
  ): Promise<TResponse> {
    return await Promise.all(files.map((file) => this.upload(user, file)));
  }

  async uploads(user: Partial<User>, files: TFile[]): Promise<TResponse> {
    if (!files || !files.length) return 'Files not provided';

    const uploadResults: Array<TMediaUploadResult> = [];

    // 1️⃣ Upload files to S3 first (sequentially or in parallel)
    for (const file of files) {
      const { originalname, buffer, mimetype, encoding, size } = file;
      const { modified_name, type } = this._s3.get_meta(originalname);
      const { cloudfront_path, path } = this._s3.paths(modified_name);

      await this._s3.upload(buffer, modified_name, type);
      uploadResults.push({
        originalname,
        modified_name,
        cloudfront_path,
        path,
        type,
        mimetype,
        size,
        encoding,
      });
    }

    // 2️⃣ Insert media records in DB using a single transaction
    return await this._database.$transaction(async (prisma) => {
      const createPromises = uploadResults.map((file) =>
        prisma.media.create({
          data: {
            user_id: user.id,
            cloudfront_path: file.cloudfront_path,
            path: file.path,
            modified_name: file.modified_name,
            name: file.originalname,
            resource_type: file.type,
            mime_type: file.mimetype || file.type,
            size: file.size,
            encoding: file.encoding,
          },
          select: {
            id: true,
            name: true,
            resource_type: true,
            cloudfront_path: true,
            path: true,
            size: true,
          },
        }),
      );

      return await Promise.all(createPromises);
    });
  }

  async delete(user: Partial<User>, media_id: string): Promise<TResponse> {
    const media = await this._database.media.findUnique({
      where: { id: media_id, user_id: user.id, deleted_at: null },
      select: { name: true },
    });

    if (!media) {
      throw new NotFoundException(
        'Media does not exist or already been deleted',
      );
    }

    await Promise.all([
      this._s3.delete(media.name),
      this._database.media.delete({
        where: { id: media_id },
      }),
    ]);

    return 'Media deleted successfully';
  }

  async delete_many(
    user: Partial<User>,
    media_ids: string | string[],
  ): Promise<TResponse> {
    const unique_media_ids: string[] = Utils.getArray<string>(media_ids);

    if (!unique_media_ids.length) {
      throw new BadRequestException('Media ids must be array');
    }

    const result = await this._database.$transaction(async (prisma) => {
      const medias = await prisma.media.findMany({
        where: {
          user_id: user.id,
          id: { in: unique_media_ids },
          deleted_at: null,
        },
        select: { id: true, name: true },
      });

      if (!medias.length) {
        throw new NotFoundException('One or more media does not exist');
      }

      const names = medias.map((m) => m.name);

      // Delete DB entries
      await prisma.media.deleteMany({
        where: { id: { in: unique_media_ids } },
      });

      return names; // return S3 file names for deletion
    });

    // Delete files from S3 after DB transaction succeeds
    await this._s3.delete_multiple(result);

    return `${result.length} media item(s) deleted successfully`;
  }

  async delete_by_name(name?: string, user_id?: string) {
    await this._database.media.deleteMany({
      where: {
        name,
        ...(user_id ? { user_id } : undefined),
      },
    });

    if (name) {
      await this._s3.delete(name);
    }
  }

  async get(user_id: string, query: TPaginationQuery): Promise<TResponse> {
    const { page, take } = query;
    const { skip } = Utils.pagination(page);

    const key = RedisCacheKeys.medias(user_id);

    const cache_medias = await this._cache.get_set_members<Partial<Media>>(
      `${key}.skip:${skip}.take:${take}`,
    );

    if (cache_medias && cache_medias.length) {
      return cache_medias;
    }

    const medias = await this._database.media.findMany({
      where: { user_id, deleted_at: null },
      select: {
        id: true,
        path: true,
        cloudfront_path: true,
        size: true,
        name: true,
        resource_type: true,
        mime_type: true,
        deleted_at: true,
      },
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });

    if (!medias.length) return [];

    await this._cache.add_to_set(
      `${key}.skip:${skip}.take:${take}`,
      medias,
      86400,
    );

    return medias;
  }
}
