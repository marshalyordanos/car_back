import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentType })
  @IsNotEmpty()
  type: PaymentType;
}

export class ReleasePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hostId: string;
}

export class PayPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
export class RefundPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  refundAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export interface PaymentConfirmDto {
  bookingId: string;
  paymentId: string;
  method: PaymentMethod;
  Id: string;
  total: number;
  transactionId: string;
}
