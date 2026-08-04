import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { NotificationRoutes } from './routes';
import { TPaginationQuery } from 'utils/dtos/query.dto';
import { TRequest } from 'utils/interfaces/t-request';

@ApiTags('Notification APIs')
@ApiBearerAuth('auth')
@Controller(NotificationRoutes.Root)
export class NotificationsController {
  constructor(private readonly _notification: NotificationsService) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get user all recieved notifications' })
  @HttpCode(200)
  @Get(NotificationRoutes.List)
  @UseGuards(JwtAuthGuard)
  get(@Req() req: TRequest, @Query() query: TPaginationQuery) {
    return this._notification.get(req.user, query);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Delete my received notification' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Delete(NotificationRoutes.Delete)
  delete(
    @Req() req: TRequest,
    @Param('notification_id') notification_id: string,
  ) {
    return this._notification.delete(req.user, notification_id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Delete all my received notification' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Delete(NotificationRoutes.DeleteAll)
  delete_all(@Req() req: TRequest) {
    return this._notification.delete_all(req.user);
  }
}
