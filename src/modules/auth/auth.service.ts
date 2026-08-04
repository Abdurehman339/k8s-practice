import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TResponse } from 'utils/interfaces/return';
import Utils from 'utils/service';
import { IAuthService } from './interface';
import { DatabaseService } from 'src/database/database.service';
import { TokenService } from '../token/token.service';
import { EOTP, EUserRole, Prisma, User } from '@prisma/client';
import DSignupWithProfile from './dto/signup';
import { DSignin } from './dto/signin';
import { DForgotPassword } from './dto/forgot-password';
import { DVerifyOTP } from './dto/verify-otp';
import { DResendOTP } from './dto/resent-otp';
import { DResetPassword } from './dto/reset-password';
import { TSigninTokenPayload } from '../token/types';
import { GlobalCacheService } from '../global-cache/cache.service';
import { AppConfig } from 'src/config';
import { AuthQueueService } from './queue';
// import { TSendgridEmail } from './types';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly _database: DatabaseService,
    private readonly _token: TokenService,
    private readonly _cache: GlobalCacheService,
    private readonly _authQueueService: AuthQueueService,
  ) {}

  async onModuleInit() {
    let admin = await this._database.user.findFirst({
      where: { email: 'admin@gmail.com' },
    });

    if (!admin) {
      const password = await this._token.hash('12345678');

      let [role, admin] = await Promise.all([
        this._database.role.findFirst({ where: { name: EUserRole.Admin } }),
        this._database.user.create({
          data: {
            name: 'Admin',
            email: 'admin@gmail.com',
            email_verified: true,
            address: 'Pembroke Pines, Florida US',
            location: { coordinates: [-80.313614, 26.012501] },
            phone: '00000000',
            password,
          },
        }),
      ]);

      await this._database.userRole.create({
        data: {
          user_id: admin.id,
          role_id: role.id,
        },
      });
    }
  }

  async signup(payload: DSignupWithProfile): Promise<TResponse> {
    const {
      email,
      password,
      name,
      profile_image_id,
      phone,
      role,
      location = [],
    } = payload;

    const [userExists, roleExists] = await Promise.all([
      this._database.user.findFirst({
        where: { email, deleted_at: null },
      }),
      this._database.role.findFirst({
        where: { name: role, deleted_at: null },
        select: { id: true },
      }),
    ]);

    if (userExists && roleExists) {
      const userRoleExists = await this._database.userRole.findFirst({
        where: {
          user_id: userExists && userExists.id,
          role_id: roleExists.id,
        },
      });
      if (userRoleExists) {
        throw new BadRequestException('Email already exist');
      }
    }

    let profile: any = {};
    if (profile_image_id) {
      const media = await this._database.media.findFirst({
        where: { id: profile_image_id, deleted_at: null },
        select: { path: true, cloudfront_path: true },
      });

      if (!media) {
        throw new NotFoundException('Profile image does not exist');
      }

      profile.path = media.path;
      profile.cdn = media.cloudfront_path;
    }

    const hashedPassword = await this._token.hash(password);

    const finalPayload: Prisma.UserCreateInput = {
      name,
      email,
      phone,
      password: hashedPassword,
    };

    if (profile_image_id) {
      finalPayload.profile_image = {
        connect: { id: profile_image_id },
      };
    }

    if (location && location.length === 2) {
      finalPayload.location = {
        coordinates: location,
      };
    }

    const [foundRole, createdUser, generatedToken] = await Promise.all([
      this._database.role.findFirst({ where: { name: role } }),
      userExists || this._database.user.create({ data: finalPayload }),
      userExists.email_verified || this._token.generate({ email }, EOTP.Verify),
    ]);

    await this._database.userRole.create({
      data: {
        role_id: foundRole.id,
        user_id: createdUser.id,
      },
    });

    // send otp to user email
    // if (Config.email.sendgrid && user) {
    //   const { text, subject } = Utils.get_email_payload(
    //     OTP.VERIFY_OTP,
    //     token,
    //   );

    //   await this._authQueueService.email<TSendgridEmail>({
    //     email: user.email,
    //     name: user.name,
    //     subject,
    //     text,
    //     otp: token,
    //     type: OTP.VERIFY_OTP,
    //   });
    // }

    return 'Signup successfully';
  }

  async signin(payload: DSignin): Promise<TResponse> {
    const { email, password, role } = payload;

    let [userExists, roleExists] = await Promise.all([
      this._database.user.findUnique({
        where: { email, deleted_at: null },
        select: {
          password: true,
          id: true,
          email: true,
          name: true,
          address: true,
          location: true,
          profile_image_id: true,
          phone: true,
          refresh_token: true,
          refresh_token_expiry: true,
          email_verified: true,
        },
      }),
      this._database.role.findFirst({
        where: {
          name: role,
        },
      }),
    ]);

    if (!userExists) {
      throw new NotFoundException('User with this email does not exist');
    }

    let userRoleExists = await this._database.userRole.findFirst({
      where: {
        user_id: userExists.id,
        role_id: roleExists.id,
      },
    });

    if (!userRoleExists) {
      throw new NotFoundException(`User with role ${role} does not exist`);
    }

    if (!userExists.email_verified) {
      throw new UnauthorizedException('User must be verified');
    }

    const isPasswordValid = await this._token.is_valid_password(
      password,
      userExists.password,
    );

    delete userExists.password;

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const tokenPayload: TSigninTokenPayload = {
      id: userExists.id,
      role: roleExists.name as EUserRole,
    };

    const [signedToken, refreshToken] = await Promise.all([
      this._token.signAsync(tokenPayload),
      this._token.signAsync(tokenPayload, { expiresIn: '7d' }),
    ]);

    const refreshTokenExpiry = Utils.getRefreshTokenExpiry();

    if (refreshToken) {
      // Save refresh token in DB (hashed is safer)
      await this._database.user.update({
        where: { id: userExists.id },
        data: {
          refresh_token: refreshToken,
          refresh_token_expiry: refreshTokenExpiry, // e.g. 7 days
        },
      });
    }

    // cache user with refresh token & its expiry
    await this._token.cache({
      ...userExists,
      refresh_token: refreshToken,
      refresh_token_expiry: refreshTokenExpiry,
    });

    const tokens = {
      access_token: signedToken,
      refresh_token: refreshToken,
    };

    return {
      status: true,
      message: 'Signin Successfully',
      data: tokens,
    };
  }

  async forgot_password(payload: DForgotPassword): Promise<TResponse> {
    const { email } = payload;

    const user = await this._database.user.findUnique({
      where: { email, deleted_at: null },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exists');
    }

    const token = await this._token.generate({ email }, EOTP.Forgot_Password);

    if (token) {
      // await sendEmail({
      //   to: payload.email,
      //   subject: 'Forgot Password OTP',
      //   text: `Your Forgot Password OTP is ${token}`,
      // });
      // if (Config.email.sendgrid && user) {
      //   const { text, subject } = Utils.get_email_payload(
      //     OTP.VERIFY_OTP,
      //     token,
      //   );
      //   await this._authQueueService.email<TSendgridEmail>({
      //     email: user.email,
      //     name: user.name,
      //     subject,
      //     text,
      //     otp: token,
      //     type: OTP.VERIFY_OTP,
      //   });
      // }
    }

    return 'Reset OTP has been sent to your email';
  }

  async verify(payload: DVerifyOTP): Promise<TResponse> {
    const { email, code, type } = payload;

    const user = await this._database.user.findFirst({
      where: { email, deleted_at: null },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exists');
    }

    const cachedToken = await this._token.validate({ email }, type);

    if (!cachedToken) {
      throw new BadRequestException('Verification OTP does not exist');
    }

    if (code !== cachedToken) {
      throw new BadRequestException('OTP is incorrect');
    }

    if (type === EOTP.Forgot_Password) {
      await this._token.setTemporaryFlag(email, EOTP.Forgot_Password);
      return 'OTP verified successfully';
    }

    if (type === EOTP.Verify) {
      await this._database.user.update({
        where: { email },
        data: {
          email_verified: true,
        },
      });
    }

    await this._cache.clear(AppConfig.GetOTPCacheKey(email, type));
    return 'User verified successfully';
  }

  async resend_otp(payload: DResendOTP): Promise<TResponse> {
    const { email, type } = payload;

    const token = await this._token.generate({ email }, type);

    // if (token && Config.email.sendgrid) {
    //   const { text, subject } = Utils.get_email_payload(type, token);
    //   await this._authQueueService.email<TSendgridEmail>({
    //     email,
    //     name: 'User',
    //     subject,
    //     text,
    //     otp: token,
    //     type,
    //   });
    // }

    return 'Token resent successfully';
  }

  async reset_password(payload: DResetPassword): Promise<TResponse> {
    const { email, password } = payload;

    const isVerified = await this._token.isVerified(
      email,
      EOTP.Forgot_Password,
    );

    if (!isVerified) {
      throw new BadRequestException(
        'OTP verification is required before resetting password',
      );
    }

    const [hashedPassword] = await Promise.all([
      this._token.hash(password),
      this._token.clearTemporaryFlag(email, EOTP.Forgot_Password),
    ]);

    const user = await this._database.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('User does not exists or update failed');
    }

    await this._token.delete({ email }, EOTP.Forgot_Password);

    return 'Password reset succesfully';
  }

  async signout(user: Partial<User>): Promise<TResponse> {
    await Promise.all([
      this._token.clear_cache(user),
      this._database.user.update({
        where: { id: user.id },
        data: { refresh_token: null, refresh_token_expiry: null },
      }),
    ]);

    return 'Signout Successfully';
  }

  async refresh_session(refresh_token: string): Promise<TResponse> {
    const verified = this._token.verify(refresh_token);

    const key = AppConfig.GetAuthKey(verified.id);
    let user = await this._cache.get<Partial<User>>(key);
    let role = verified.role as EUserRole;

    if (!user) {
      const [fetchedUser, fetchedRole] = await Promise.all([
        this._database.user.findUnique({
          where: { id: verified.id },
          select: {
            id: true,
            email: true,
            name: true,
            address: true,
            location: true,
            profile_image_id: true,
            phone: true,
            refresh_token: true,
            refresh_token_expiry: true,
            email_verified: true,
          },
        }),
        this._database.role.findFirst({
          where: {
            name: verified.role,
          },
        }),
      ]);

      user = fetchedUser;

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const userRole = await this._database.userRole.findFirst({
        where: {
          user_id: user.id,
          role_id: fetchedRole.id,
        },
      });

      if (!userRole) {
        throw new NotFoundException(
          `User with role ${fetchedRole.name} not exist`,
        );
      }

      role = fetchedRole.name as EUserRole;
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('User must be verified first');
    }

    if (!user.refresh_token) {
      throw new UnauthorizedException('Refresh token does not exist');
    }

    if (refresh_token !== user.refresh_token) {
      throw new BadRequestException('Invalid refresh token');
    }

    const now = new Date();
    const expiry = new Date(user.refresh_token_expiry);

    // Generate access token (short lived)
    const tokenPayload: TSigninTokenPayload = { id: user.id, role: role };
    const signedToken = await this._token.signAsync(tokenPayload);

    // If refresh token is still valid, reuse it
    if (expiry > now) {
      return [signedToken, user.refresh_token];
    }

    // Otherwise generate a new refresh token
    const refreshToken = await this._token.signAsync(tokenPayload, {
      expiresIn: '7d',
    });
    const refreshTokenExpiry = Utils.getRefreshTokenExpiry();

    await Promise.all([
      this._database.user.update({
        where: { id: user.id },
        data: {
          refresh_token: refreshToken,
          refresh_token_expiry: refreshTokenExpiry,
        },
      }),
      this._token.cache({
        ...user,
        refresh_token: refreshToken,
        refresh_token_expiry: refreshTokenExpiry,
      }),
    ]);

    return [signedToken, refreshToken];
  }
}
