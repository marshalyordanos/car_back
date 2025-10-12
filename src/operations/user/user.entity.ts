import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDto {
  name: string;
  email: string;
  password: string;
  role?: string; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
}

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional() profilePhotoFile?: Express.Multer.File;
  @IsOptional() driverLicenseFile?: Express.Multer.File;
  @IsOptional() nationalIdFile?: Express.Multer.File;
}

export class UserCreteDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}

export class CreateHostDto {
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

  // File uploads
  @IsOptional() profilePhotoFile?: Express.Multer.File;
}
export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class HostProfileDto {
  @IsString()
  @IsOptional()
  payoutMethod?: string;

  @IsOptional()
  @IsNumber()
  earnings?: number;
}

export class HostVerifyDto {
  @IsBoolean()
  isVerified: boolean;
}
export class IsActiveDto {
  @IsBoolean()
  isActive: boolean;
}
export class AddToWishlistDto {
  @IsNotEmpty()
  @IsString()
  carId: string;
}

export class RemoveFromWishlistDto {
  @IsNotEmpty()
  @IsString()
  carId: string;
}
