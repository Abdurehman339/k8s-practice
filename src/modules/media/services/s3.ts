import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AppConfig } from 'src/config';
import * as uuid from 'uuid';
import { TGetMetaResponse } from '../types';
import { TResponse } from 'utils/interfaces/return';
import { Body } from 'aws-sdk/clients/s3';
import { EMediaType } from '@prisma/client';

@Injectable()
export class S3Service {
  constructor() {}

  private AWS_S3_BUCKET = AppConfig.aws.s3.name;

  private s3 = new AWS.S3({
    endpoint: AppConfig.aws.s3.endpoint,
    region: AppConfig.aws.s3.region,
    credentials: {
      accessKeyId: AppConfig.aws.s3.access_key_id,
      secretAccessKey: AppConfig.aws.s3.access_key_secret,
    },
  });

  private allowed_extensions = {
    [EMediaType.Image]: ['png', 'jpg', 'bmp', 'jpeg', 'gif'],
    [EMediaType.Video]: ['mov', 'wav', 'mp4', 'avi', 'flv', 'wav', 'mov'],
    [EMediaType.Document]: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    [EMediaType.Archive]: ['zip', 'gzip'],
    [EMediaType.Other]: [],
    [EMediaType.Unsupported]: [],
  };

  private get_extenstion(name: string): string {
    return name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  }

  private get_type(extension: string): EMediaType {
    for (const [mediaType, extensions] of Object.entries(
      this.allowed_extensions,
    )) {
      if (extensions.includes(extension)) {
        return mediaType as EMediaType;
      }
    }
    return EMediaType.Other;
  }

  private get_modified_name(original_name: string): string {
    return `${uuid.v4()}.${original_name}`;
  }

  get_meta(name: string): TGetMetaResponse {
    const extension = this.get_extenstion(name);
    const type = this.get_type(extension);
    const modified_name = this.get_modified_name(name);

    return { extension, type, modified_name };
  }

  async upload(file: Body, name: string, mimetype: string) {
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: this.AWS_S3_BUCKET,
      Key: name,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      // ContentDisposition: 'inline',
      ContentDisposition: 'attachment',
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete_multiple(names: string[]): Promise<TResponse> {
    try {
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Delete: {
          Objects: names.map((Key: string) => ({ Key })),
        },
      };

      await this.s3.deleteObjects(params).promise();

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(name: string): Promise<TResponse> {
    try {
      const params = { Bucket: this.AWS_S3_BUCKET, Key: name };
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  paths(name?: string) {
    if (!name) return;
    return {
      cloudfront_path: `https://dsrnu0g19obmq.cloudfront.net/${name}`,
      path: `https://nova-s3.sfo3.cdn.digitaloceanspaces.com/${name}`,
    };
  }
}
