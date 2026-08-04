import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { AuthApiRoutes } from './routes';
import { DSignin } from './dto/signin';
import { DForgotPassword } from './dto/forgot-password';
import { DVerifyOTP } from './dto/verify-otp';
import { seconds, Throttle } from '@nestjs/throttler';
import DSignup from './dto/signup';
import { DResetPassword } from './dto/reset-password';
import { DResendOTP } from './dto/resent-otp';
import { TRrefreshSession } from './dto/refresh-session';
import { TRequest } from 'utils/interfaces/t-request';

@Controller(AuthApiRoutes.Root)
@ApiTags('Authentication APIs')
export class AuthController {
  constructor(private readonly _auth: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signup Successful',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or Password is invalid',
  })
  @ApiBody({ type: DSignup })
  @ApiOperation({ summary: 'User Signup (Doctor, Patient)' })
  @HttpCode(201)
  @Post(AuthApiRoutes.Signup)
  signup(@Body() payload: DSignup) {
    return this._auth.signup(payload);
  }

  @Throttle({ default: { limit: 6, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Signin Successful',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or Password is invalid',
  })
  @ApiBody({ type: DSignin })
  @ApiOperation({ summary: 'User Signin (Doctor, Patient)' })
  @HttpCode(200)
  @Post(AuthApiRoutes.Signin)
  signin(@Body() payload: DSignin) {
    return this._auth.signin(payload);
  }

  @Throttle({ default: { limit: 6, ttl: seconds(60) } })
  @ApiResponse({ status: HttpStatus.OK, description: 'OTP sent Successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email address',
  })
  @ApiOperation({ summary: 'Recover Forgotten Password' })
  @ApiBody({ type: DForgotPassword })
  @HttpCode(200)
  @Patch(AuthApiRoutes.ForgotPassword)
  forgot_password(@Body() payload: DForgotPassword) {
    return this._auth.forgot_password(payload);
  }

  @Throttle({ default: { limit: 6, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proceed to Reset Password',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'OTP is incorrect',
  })
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiBody({ type: DVerifyOTP })
  @HttpCode(200)
  @Post(AuthApiRoutes.Verify)
  verify(@Body() payload: DVerifyOTP) {
    return this._auth.verify(payload);
  }

  @Throttle({ default: { limit: 6, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Refresh token is invalid',
  })
  @ApiBody({ type: TRrefreshSession })
  @ApiOperation({ summary: 'Refresh session (access token)' })
  @HttpCode(200)
  @ApiBearerAuth('auth')
  @UseGuards(JwtAuthGuard)
  @Post(AuthApiRoutes.RefreshSession)
  refresh_session(@Req() req: TRequest) {
    return this._auth.refresh_session(req.user.refresh_token);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password Reset Successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'OTP is incorrect',
  })
  @ApiOperation({ summary: 'Reset user account password' })
  @ApiBody({ type: DResetPassword })
  @HttpCode(200)
  @Patch(AuthApiRoutes.ResetPassword)
  reset_password(@Body() payload: DResetPassword) {
    return this._auth.reset_password(payload);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password Reset Successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'OTP is incorrect',
  })
  @ApiOperation({ summary: 'Reset OTP for verfication' })
  @ApiBody({ type: DResendOTP })
  @HttpCode(200)
  @Patch(AuthApiRoutes.ResendOTP)
  resend_otp(@Body() payload: DResendOTP) {
    return this._auth.resend_otp(payload);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'signout Successfuly' })
  @ApiOperation({ summary: 'Signout from the Account' })
  @HttpCode(200)
  @ApiBearerAuth('auth')
  @UseGuards(JwtAuthGuard)
  @Post(AuthApiRoutes.Signout)
  signout(@Req() req: TRequest) {
    return this._auth.signout(req.user);
  }
}
