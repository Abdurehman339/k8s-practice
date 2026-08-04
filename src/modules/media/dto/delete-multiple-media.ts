import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class TDeleteMultipleMedia {
  @ApiProperty({ required: true, examples: ['media_id', 'media_id:2'] })
  @IsArray()
  @IsNotEmpty()
  media_ids: string[];
}
