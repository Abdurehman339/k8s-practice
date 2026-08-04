import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const privateKeyPath = path.resolve(
          process.cwd(),
          'keys/private_key.pem',
        );
        const publicKeyPath = path.resolve(
          process.cwd(),
          'keys/public_key.pem',
        );

        // const privateKeyPath = path.resolve(
        //   __dirname,
        //   '../../../keys/private_key.pem',
        // );
        // const publicKeyPath = path.resolve(
        //   __dirname,
        //   '../../../keys/public_key.pem',
        // );

        console.log('🔑 Using privateKey from:', privateKeyPath);
        console.log('🔑 Using publicKey from:', publicKeyPath);

        return {
          // privateKey: fs.readFileSync(
          //   path.resolve(__dirname, '../../../../keys/private_key.pem'),
          // ),
          // publicKey: fs.readFileSync(
          //   path.resolve(__dirname, '../../../../keys/public_key.pem'),
          // ),
          privateKey: fs.readFileSync(privateKeyPath),
          publicKey: fs.readFileSync(publicKeyPath),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '15m',
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
