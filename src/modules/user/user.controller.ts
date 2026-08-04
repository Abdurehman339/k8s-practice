import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import UserApiRoutes from './routes';
import { UserService } from './user.service';
import { seconds, Throttle } from '@nestjs/throttler';
import { TUpdateProfile } from './dto/update';
import { TRequest } from 'utils/interfaces/t-request';
import { TContactUs } from './dto/contact-us';

@ApiTags('User APIs')
@ApiBearerAuth('auth')
@Controller(UserApiRoutes.Root)
export class UserController {
  constructor(private readonly _user: UserService) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get logged in user data' })
  @UseGuards(JwtAuthGuard)
  @Get(UserApiRoutes.Get)
  read(@Req() req: TRequest) {
    return this._user.read(req.user);
  }

  @Throttle({ default: { limit: 6, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile information updated successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Update user information' })
  @ApiBody({ type: TUpdateProfile })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Patch(UserApiRoutes.UpdateProfile)
  update(@Req() req: TRequest, @Body() payload: TUpdateProfile) {
    return this._user.update(req.user.id, payload);
  }

  // @Throttle({ default: { limit: 20, ttl: seconds(60) } })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Email sent successfully',
  // })
  // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  // @ApiOperation({ summary: 'Contact support email (appcrops)' })
  // @HttpCode(200)
  // @ApiBody({ type: TContactUs })
  // @Post(UserApiRoutes.Contact)
  // contact(@Body() payload: TContactUs) {
  //   return this._user.contact(payload);
  // }
}
