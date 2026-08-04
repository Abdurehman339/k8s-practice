export class AuthApiRoutes {
  static readonly Root = 'auth';

  static readonly Signup = '/signup';
  static readonly Signin = '/signin';
  static readonly Signout = '/signout';

  static readonly ForgotPassword = '/password/forgot';
  static readonly ResetPassword = '/password/reset';

  static readonly Verify = '/verify';
  static readonly ResendOTP = '/otp/resend';
  static readonly RefreshSession = '/refresh';
}

export class OAuthAPIRoutes {
  static readonly Root = 'oauth';

  static readonly GoogleSSO = '/google/legacy';
  static readonly AppleSSO = '/apple/legacy';

  static readonly OAUTH_SSO = '/sso';
}
