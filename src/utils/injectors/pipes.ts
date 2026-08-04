import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export default function InjectPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.flatMap((error) => {
          // Recursively flatten nested errors
          const flatten = (err: any, parentPath = ''): string[] => {
            if (err.constraints) {
              // remove nested path before dot
              return Object.values(err.constraints).map((msg: string) => msg);
            }
            if (err.children && err.children.length > 0) {
              return err.children.flatMap((child) =>
                flatten(child, err.property),
              );
            }
            return [];
          };
          return flatten(error);
        });
        return new BadRequestException(formattedErrors);
      },
    }),
  );
}
