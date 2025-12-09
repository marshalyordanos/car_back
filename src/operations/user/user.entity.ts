import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiPropertyOptional({ description: 'SUPER_ADMIN, CUSTOMER, DRIVER etc.' })
  role?: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  phone: string;
}

export class UserUpdateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  profilePhotoFile?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  driverLicenseFile?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  nationalIdFile?: Express.Multer.File;
}

export class UserCreteDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleId?: string;
}
export class PlatformFeeDto {
  @ApiProperty()
  @IsNumber()
  platformFee: number;

  @ApiProperty()
  @IsNumber()
  commissionRate: number;
}

export class CreateHostDto {
  @ApiProperty({ description: 'First Name' })
  @IsNotEmpty({ message: 'First Name is required' })
  @IsString({ message: 'First Name must be a string' })
  firstName: string;

  @ApiProperty({ description: 'Last Name' })
  @IsNotEmpty({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  lastName: string;

  @ApiProperty({ description: 'Email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({ description: 'Phone' })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  // File uploads
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  profilePhotoFile?: Express.Multer.File;
}

export class ChangeRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class HostProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  payoutMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  earnings?: number;
}

export class DashboardSummaryDto {
  @ApiPropertyOptional({
    description: 'Type of summary data to fetch',
    enum: [
      'user',
      'car',
      'dispute',
      'payment',
      'booking',
      'total',
      'latestBookings',
      'graph',
    ],
  })
  @IsOptional()
  @IsIn([
    'user',
    'car',
    'dispute',
    'payment',
    'booking',
    'total',
    'latestBookings',
    'graph',
  ])
  entity?:
    | 'user'
    | 'car'
    | 'dispute'
    | 'payment'
    | 'booking'
    | 'total'
    | 'latestBookings'
    | 'graph';

  @ApiPropertyOptional({ description: 'Start date for filtering data' })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering data' })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
export class HostVerifyDto {
  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;
}

export class IsActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class AddToWishlistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  carId: string;
}

export class RemoveFromWishlistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  carId: string;
}
