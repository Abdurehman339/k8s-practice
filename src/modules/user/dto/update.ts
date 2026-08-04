import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class TUpdateProfile {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  profile_image_id?: string;

  // Old password is required only if password is provided
  @ValidateIf((o) => !!o.password)
  @ApiPropertyOptional({ required: false, example: '12345678' })
  @Length(8, 20, {
    message: 'Old password Must be between 8 and 20 characters',
  })
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  old_password: string;

  // New password is required only if old_password is provided
  @ValidateIf((o) => !!o.old_password)
  @ApiPropertyOptional({ required: false, example: '12345679' })
  @Length(8, 20, { message: 'Must be between 8 and 20 characters' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({ required: false, examples: [71.96, 47.51] })
  @IsOptional()
  @IsArray()
  location?: number[];
}
