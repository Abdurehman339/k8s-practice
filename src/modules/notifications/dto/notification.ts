import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TSetFCMToken {
  @ApiProperty({ required: true })
  @Transform(({ value }) => (value ? value.trim() : undefined))
  @IsString()
  @IsNotEmpty()
  fcm_token: string;
}
