// booking.entity.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsNotEmpty() @IsString() carId: string;
  @IsNotEmpty() @IsString() guestId: string;
  @IsNotEmpty() @IsString() hostId: string;

  @IsNotEmpty() startDate: Date;
  @IsNotEmpty() endDate: Date;
  @IsNotEmpty() @IsNumber() totalPrice: number;
  @IsOptional() @IsBoolean() withDriver?: boolean;

  @IsNotEmpty() @IsNumber() pickupLat: number;
  @IsNotEmpty() @IsNumber() pickupLng: number;
  @IsNotEmpty() @IsString() pickupName: string;

  @IsNotEmpty() @IsNumber() dropoffLat: number;
  @IsNotEmpty() @IsNumber() dropoffLng: number;
  @IsNotEmpty() @IsString() dropoffName: string;
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
