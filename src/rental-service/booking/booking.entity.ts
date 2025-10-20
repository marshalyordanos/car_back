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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  carId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  guestId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hostId: string;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pickupLat: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pickupLng: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pickupName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  dropoffLat: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  dropoffLng: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dropoffName: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickupName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dropoffLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dropoffLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dropoffName?: string;
}

export class UpdateBookingGustDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickupName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dropoffLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dropoffLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dropoffName?: string;
}

export class BookingChangeStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsString()
  status: BookingStatus;
}

export interface PaymentConfirmDto {
  bookingId: string;
  paymentId: string;
  method: PaymentMethod;
  transactionId: string;
  total: number;
}

export class BookingInspectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ enum: InspectionType })
  @IsEnum(InspectionType)
  type: InspectionType;

  // @ApiPropertyOptional({ type: [String] })
  // @IsArray()
  // @IsOptional()
  // photos?: string[];

  @ApiProperty()
  @IsNumber()
  fuelLevel: number;

  @ApiProperty()
  @IsNumber()
  mileage: number;
}

export class BookingInspectionUpdateDto {
  // @ApiPropertyOptional({ type: [String] })
  // @IsOptional()
  // @IsArray()
  // photos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fuelLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mileage?: number;
}
