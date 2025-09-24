import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDisputeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  carId?: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdateDisputeStatusDto {
  @IsNotEmpty()
  @IsString()
  disputeId: string;

  @IsNotEmpty()
  @IsString()
  status: string; // "RESOLVED" | "REJECTED" | "OPEN"
}
