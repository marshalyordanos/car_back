import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDisputeStatusDto {
  @IsNotEmpty()
  @IsString()
  disputeId: string;

  @IsNotEmpty()
  @IsString()
  status: string; // "RESOLVED" | "REJECTED" | "OPEN"
}

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string; // who opens the dispute (guest or host)

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @IsOptional()
  photos?: string[]; // URLs
}

export class DisputeResolveDto {
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @IsNumber()
  @IsOptional()
  refundAmount?: number; // partial or full refund amount

  @IsString()
  @IsOptional()
  notes?: string;
}
