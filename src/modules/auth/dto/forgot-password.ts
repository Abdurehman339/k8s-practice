import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class DForgotPassword {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;
}
