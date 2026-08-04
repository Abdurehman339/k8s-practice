import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class TChangePassword {
  @ApiProperty({ required: true, example: '12345678' })
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  @Length(8, 30, { message: 'Must be between 8 and 30 characters' })
  old_password: string;

  @ApiProperty({ required: true, example: '12345679' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 30, { message: 'Must be between 8 and 30 characters' })
  password: string;
}
