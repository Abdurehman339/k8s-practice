import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TContactUs {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  how_we_can_help_you: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  budget?: string;
}
