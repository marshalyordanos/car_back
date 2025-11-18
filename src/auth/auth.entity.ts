import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthRegisterDto {
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

  @ApiProperty({ description: 'Phone number' })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiProperty({ description: 'Password', minLength: 6 })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({ description: 'Role ID' })
  @IsOptional()
  @IsString({ message: 'Role ID must be a string' })
  role?: string;

  // File uploads
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

export class AuthLoginDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AuthChangePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}

export class PhoneVerifyDto {
  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsString()
  phone: string;
}
export class PhoneVerifyResendDto {
  @ApiProperty()
  @IsString()
  phone: string;
}

export class AuthForgotPasswordDto {
  @ApiProperty()
  phone: string;
}

export interface AuthVerifyEmailDto {
  token: string;
}

export class AuthMfaDto {
  @ApiProperty()
  code: string;
}

export interface AuthSession {
  id: string;
  device: string;
  ip: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthRequestPasswordResetDto {
  @ApiProperty()
  @IsString()
  phoneNumber: string;
}

// Step 2: Reset password with OTP
export class AuthResetPasswordDto {
  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}
