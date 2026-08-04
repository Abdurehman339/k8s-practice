import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EUserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsArray,
} from 'class-validator';

export default class DSignup {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profile_image_id?: string;

  @ApiProperty({ required: true, example: 'John' })
  @IsString()
  @Transform(({ value }) =>
    value
      ? value?.trim().charAt(0).toUpperCase() + value?.trim().slice(1)
      : undefined,
  )
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => (value ? value?.trim().toLowerCase() : undefined))
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  password: string;

  @ApiProperty({ required: true, enum: EUserRole })
  @IsEnum(EUserRole, { each: true })
  @IsNotEmpty()
  role: EUserRole;

  @ApiPropertyOptional({ required: false, examples: [71.96, 47.51] })
  @IsOptional()
  @IsArray()
  location?: number[];
}
