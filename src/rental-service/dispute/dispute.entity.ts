import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDisputeStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  disputeId: string;

  @ApiProperty({ description: 'RESOLVED | REJECTED | OPEN' })
  @IsNotEmpty()
  @IsString()
  status: string; // "RESOLVED" | "REJECTED" | "OPEN"
}

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string; // who opens the dispute (guest or host)

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  photos?: string[]; // URLs
}

export class DisputeResolveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  refundAmount?: number; // partial or full refund amount

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
