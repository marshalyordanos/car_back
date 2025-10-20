import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ReviewType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revieweeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carId?: string;

  @ApiProperty({ enum: ReviewType })
  @IsNotEmpty()
  @IsEnum(ReviewType)
  type: ReviewType;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class DeleteReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reviewId: string;
}
