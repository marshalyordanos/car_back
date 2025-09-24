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

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @IsOptional()
  @IsString()
  revieweeId?: string;

  @IsOptional()
  @IsString()
  carId?: string;

  @IsNotEmpty()
  @IsEnum(ReviewType)
  type: ReviewType;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class DeleteReviewDto {
  @IsNotEmpty()
  @IsString()
  reviewId: string;
}
