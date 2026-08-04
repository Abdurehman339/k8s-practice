import { ApiProperty } from '@nestjs/swagger';
import { EOTP } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class DVerifyOTP {
  @ApiProperty({ required: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ required: true, example: '0573' })
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({ required: true, enum: EOTP })
  @IsEnum(EOTP)
  @IsNotEmpty({ message: 'Type is required' })
  type: EOTP;
}
