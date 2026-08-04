import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HostingerService } from 'src/utils/service/hostinger';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('NODE_MAILER_HOST'),
          port: configService.get<number>('NODE_MAILER_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('NODE_MAILER_AUTH_USER'),
            pass: configService.get<string>('NODE_MAILER_AUTH_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, HostingerService],
  exports: [UserService, HostingerService],
})
export class UserModule {}
