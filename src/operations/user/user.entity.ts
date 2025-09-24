import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
