import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaRoutes } from './routes';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { TDeleteMultipleMedia } from './dto/delete-multiple-media';
import { seconds, Throttle } from '@nestjs/throttler';
import { TRequest } from 'utils/interfaces/t-request';
import { TFile } from './types';
import { TPaginationQuery } from 'utils/dtos/query.dto';

@ApiTags('Media APIs')
@ApiBearerAuth('auth')
@Controller(MediaRoutes.root)
export class MediaController {
  constructor(private readonly _media: MediaService) {}

  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 200 * 1024 * 1024, // 200 MB limit (in bytes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload the multimedia file such pdf, video, audio and images',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(MediaRoutes.Upload)
  upload(@Req() req: TRequest, @UploadedFile() file: TFile) {
    return this._media.upload(req.user, file);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 200 * 1024 * 1024, // 200 MB limit (in bytes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload the multimedia file (anonymously) such pdf, video, audio and images',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(MediaRoutes.UploadAnonymous)
  upload_anonymous(@UploadedFile() file: TFile) {
    return this._media.upload_anonymous(file);
  }

  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', Infinity, {
      limits: {
        files: Infinity,
        fileSize: 200 * 1024 * 1024, // 200 MB limit (in bytes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple media files such pdf, video, audio and images',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post(MediaRoutes.Uploads)
  uploads(@Req() req: TRequest, @UploadedFiles() files: TFile[]) {
    return this._media.uploads(req.user, files);
  }

  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete uploaded media from database & s3 bucket' })
  @ApiParam({ name: ':media_id' })
  @Delete(MediaRoutes.Delete)
  delete(@Req() req: TRequest, @Param('media_id') media_id: string) {
    return this._media.delete(req.user, media_id);
  }

  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete multiple uploaded medias from database & s3 bucket',
  })
  @ApiQuery({ name: 'media_ids' })
  @Delete(MediaRoutes.DeleteMany)
  delete_many(@Req() req: TRequest, @Query() query: TDeleteMultipleMedia) {
    return this._media.delete_many(req.user, query.media_ids);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all uploaded media of this user',
  })
  @Get(MediaRoutes.GetUserMedia)
  get(@Req() req: TRequest, @Query() query: TPaginationQuery) {
    return this._media.get(req.user.id, query);
  }
}
