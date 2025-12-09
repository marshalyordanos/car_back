// booking.entity.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsEmail,
} from 'class-validator';
import { BookingStatus, PaymentMethod } from '@prisma/client';
import { InspectionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ description: 'First Name' })
  @IsOptional({ message: 'First Name is required' })
  @IsString({ message: 'First Name must be a string' })
  firstName?: string;

  @ApiProperty({ description: 'Last Name' })
  @IsOptional({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  lastName?: string;

  @ApiProperty({ description: 'Email' })
  @IsOptional({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email?: string;

  @ApiProperty({ description: 'Phone number' })
  // @IsOptional({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  carId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  guestId?: string;

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
  @Type(() => Boolean) // 👈 auto-convert "true"/"false" to boolean
  withDriver?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // 👈 convert "9.021" to number
  pickupLat: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // 👈 convert "9.021" to number
  pickupLng: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pickupName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // 👈 convert "9.021" to number
  dropoffLat: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // 👈 convert "9.021" to number
  dropoffLng: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dropoffName: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  driverLicenseFile?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  nationalIdFile?: Express.Multer.File;
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
