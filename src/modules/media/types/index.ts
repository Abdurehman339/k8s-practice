import { EMediaType } from '@prisma/client';

export type TGetMetaResponse = {
  extension: string;
  type: EMediaType;
  modified_name: string;
};

export type TMediaUploadResult = {
  originalname: string;
  modified_name: string;
  cloudfront_path: string;
  path: string;
  type: EMediaType;
  mimetype: string;
  size: number;
  encoding: string;
};

export type TFile = {
  originalname: string;
  buffer: Buffer | Buffer<ArrayBufferLike>;
  mimetype?: string;
  encoding?: string;
  size?: number;
};
