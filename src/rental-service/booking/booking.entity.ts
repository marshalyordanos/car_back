// booking.entity.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { BookingStatus, PaymentMethod } from '@prisma/client';
import { InspectionType } from '@prisma/client';

export class CreateBookingDto {
  @IsNotEmpty() @IsString() carId: string;
  @IsNotEmpty() @IsString() guestId: string;
  @IsNotEmpty() @IsString() hostId: string;

  @IsNotEmpty() startDate: Date;
  @IsNotEmpty() endDate: Date;
  // @IsNotEmpty() @IsNumber() totalPrice: number;
  @IsOptional() @IsBoolean() withDriver?: boolean;

  @IsNotEmpty() @IsNumber() pickupLat: number;
  @IsNotEmpty() @IsNumber() pickupLng: number;
  @IsNotEmpty() @IsString() pickupName: string;

  @IsNotEmpty() @IsNumber() dropoffLat: number;
  @IsNotEmpty() @IsNumber() dropoffLng: number;
  @IsNotEmpty() @IsString() dropoffName: string;

  @IsNotEmpty() @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
}

export class UpdateBookingDto {
  @IsOptional() @IsEnum(BookingStatus) status?: BookingStatus;
  @IsOptional() @IsNotEmpty() startDate: Date;
  @IsOptional() @IsNotEmpty() endDate: Date;
  @IsOptional() @IsNumber() totalPrice?: number;
  @IsOptional() @IsBoolean() withDriver?: boolean;

  @IsOptional() @IsNumber() pickupLat?: number;
  @IsOptional() @IsNumber() pickupLng?: number;
  @IsOptional() @IsString() pickupName?: string;

  @IsOptional() @IsNumber() dropoffLat?: number;
  @IsOptional() @IsNumber() dropoffLng?: number;
  @IsOptional() @IsString() dropoffName?: string;
}

export class UpdateBookingGustDto {
  @IsOptional() @IsBoolean() withDriver?: boolean;

  @IsOptional() @IsNumber() pickupLat?: number;
  @IsOptional() @IsNumber() pickupLng?: number;
  @IsOptional() @IsString() pickupName?: string;

  @IsOptional() @IsNumber() dropoffLat?: number;
  @IsOptional() @IsNumber() dropoffLng?: number;
  @IsOptional() @IsString() dropoffName?: string;
}
export class BookingChangeStatusDto {
  @IsString() status: BookingStatus;
}

export interface PaymentConfirmDto {
  bookingId: string;
  paymentId: string;
  method: PaymentMethod;
  transactionId: string;
  total: number;
}

export class BookingInspectionDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(InspectionType)
  type: InspectionType;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsNumber()
  fuelLevel: number;

  @IsNumber()
  mileage: number;
}

export class BookingInspectionUpdateDto {
  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsNumber()
  fuelLevel?: number;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsEnum(Boolean)
  approved?: boolean;
}
