import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class DSignin {
  @ApiProperty()
  @Transform(({ value }) => (value ? value?.trim().toLowerCase() : undefined))
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ required: true, enum: EUserRole })
  @IsEnum(EUserRole, { each: true })
  @IsNotEmpty()
  role: EUserRole;
}
