import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  payerId?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  method: PaymentMethod;

  @IsNotEmpty()
  type: PaymentType;
}

export class ReleasePaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsString()
  hostId: string;
}

export class RefundPaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsNumber()
  refundAmount: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
