import { TResponse } from 'utils/interfaces/return';
import DSignupWithProfile from '../dto/signup';
import { DSignin } from '../dto/signin';
import { DForgotPassword } from '../dto/forgot-password';
import { DVerifyOTP } from '../dto/verify-otp';
import { User } from '@prisma/client';
import { DResendOTP } from '../dto/resent-otp';
import { DResetPassword } from '../dto/reset-password';
import { OnModuleInit } from '@nestjs/common';

export interface IAuthService extends OnModuleInit {
  signup(payload: DSignupWithProfile): Promise<TResponse>;
  signin(payload: DSignin): Promise<TResponse>;
  signout(user: Partial<User>): Promise<TResponse>;
  forgot_password(payload: DForgotPassword): Promise<TResponse>;
  verify(payload: DVerifyOTP): Promise<TResponse>;
  refresh_session(refresh_token: string): Promise<TResponse>;
  resend_otp(payload: DResendOTP): Promise<TResponse>;
  reset_password(payload: DResetPassword): Promise<TResponse>;
}
