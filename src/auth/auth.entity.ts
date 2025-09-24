import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'First Name is required' })
  @IsString({ message: 'First Name must be a string' })
  firstName: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  lastName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Role ID must be a string' })
  role?: string;

  // File uploads
  @IsOptional() profilePhotoFile?: Express.Multer.File;
  @IsOptional() driverLicenseFile?: Express.Multer.File;
  @IsOptional() nationalIdFile?: Express.Multer.File;
}

export class AuthLoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}

export class AuthChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}

export class AuthResetPasswordDto {
  token: string;
  newPassword: string;
}

export class AuthForgotPasswordDto {
  email: string;
}

export interface AuthVerifyEmailDto {
  token: string;
}

export class AuthMfaDto {
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
