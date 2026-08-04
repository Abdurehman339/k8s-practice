export class MediaRoutes {
  static readonly root = 'media';

  static readonly Upload = '/upload';
  static readonly UploadAnonymous = '/upload/anonymous';
  static readonly Uploads = '/uploads';
  static readonly Delete = '/:media_id';
  static readonly DeleteMany = '/';
  static readonly GetUserMedia = '/all';
}
