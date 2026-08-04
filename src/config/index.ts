import { EOTP } from '@prisma/client';

export const AppConfig = {
  app: {
    debug: process.env.DEBUG === 'true',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '9001', 10),
    prefix: process.env.GLOBAL_PREFIX || 'api/v1',
    dev: process.env.NODE_ENV === 'development',
    prod: process.env.NODE_ENV === 'production',
    route: `http://localhost:${process.env.PORT}/${process.env.GLOBAL_PREFIX}`,
    log: {
      level: parseInt(process.env.LOG_LEVEL || '30', 10),
    },
  },
  user: { roles_key: 'role' },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    private_key: process.env.AUTH_PRIVATE_KEY,
    jwt_secret: process.env.JWT_SECRET,
  },
  cache: {
    otp_key: process.env.OTP_CACHE_KEY,
  },
  email: {
    hostinger: {
      host: process.env.NODE_MAILER_HOST,
      port: Number(process.env.NODE_MAILER_PORT) ?? null,
      auth: {
        email: process.env.NODE_MAILER_AUTH_USER,
        pasword: process.env.NODE_MAILER_AUTH_PASSWORD,
      },
    },
    sendgrid: {
      api_key: process.env.SENDGRID_API_KEY?.trim() || '',
      client_email: process.env.SENDGRID_CLIENT_EMAIL?.trim() || '',
    },
  },
  redis: {
    host: process.env.REDIS_DB_HOST,
    port: parseInt(process.env.REDIS_DB_PORT || '6379', 10),
    url: process.env.REDIS_URL,
  },
  aws: {
    s3: {
      name: process.env.AWS_S3_BUCKET_NAME,
      endpoint: process.env.AWS_S3_BUCKET_ENDPOINT,
      region: process.env.AWS_S3_BUCKET_REGION,
      access_key_id: process.env.AWS_S3_BUCKET_IAM_ACCESSKEYID,
      access_key_secret: process.env.AWS_S3_BUCKET_IAM_SECRETACCESSKEY,
    },
  },
  //   stripe: {
  //     api_key: process.env.STRIPE_API_KEY,
  //     publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
  //     webhook: {
  //       signing_secret: process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
  //     },
  //   },
  firebase: {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },

  // functions
  GetAuthKey(id?: string | undefined) {
    return `auth-${process.env.NODE_ENV || 'development'}:user.${id}`;
  },
  GetOTPCacheKey(email?: string, type?: EOTP) {
    return `${type}.${email}:${process.env.OTP_CACHE_KEY}`;
  },
};
