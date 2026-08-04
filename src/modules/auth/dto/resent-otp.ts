import { ApiProperty } from '@nestjs/swagger';
import { EOTP } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

export class DResendOTP {
  @ApiProperty({ required: true, example: 'user@gmail.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, enum: EOTP })
  @IsEnum(EOTP)
  @IsNotEmpty({ message: 'OTP type is required' })
  type: EOTP;
}
