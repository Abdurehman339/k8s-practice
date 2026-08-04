import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ESortDirection } from '@prisma/client';

export class TPaginationQuery {
  @ApiPropertyOptional({
    required: false,
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({
    required: false,
    example: 5,
    description: 'Items per page',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsPositive()
  @IsInt()
  take?: number;

  @ApiPropertyOptional({ required: false, example: 'appcrops' })
  @Transform(({ value }) => (value ? value.trim() : undefined))
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    required: false,
    example: ESortDirection.desc,
    enum: ESortDirection,
    description: 'Sort direction (asc | desc)',
  })
  @IsOptional()
  @IsEnum(ESortDirection)
  sort_dir?: ESortDirection;

  @ApiPropertyOptional({
    required: false,
    description: '[Longitude, Latitude] in numbers',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  location?: number[];
}
