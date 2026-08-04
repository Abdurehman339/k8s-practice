import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator';

export class DResetPassword {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
