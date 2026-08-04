import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TRrefreshSession {
  @ApiProperty({ required: true })
  @IsString()
  refresh_token: string;
}
