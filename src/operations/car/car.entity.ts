import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  ArrayMinSize,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import {
  CarType,
  EcoFriendly,
  InsurancePlan,
  Transmission,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CarDto {
  @IsString() hostId: string;

  @IsString() makeId: string;
  @IsString() modelId: string;
  @Type(() => Number) @IsInt() year: number;
  @IsString() color: string;
  @IsString() licensePlate: string;
  @IsOptional() @IsString() vin: string;
  @IsEnum(Transmission) transmission: Transmission;
  @Type(() => Number) @IsInt() mileage: number;

  @Type(() => Number) @IsNumber() dailyRate: number;
  @Type(() => Number) @IsNumber() rentalPricePerDay: number;
  @Type(() => Number) @IsOptional() @IsNumber() longTermDiscount?: number;

  @Type(() => Number) @IsInt() seatingCapacity: number;
  @Type(() => Number) @IsOptional() @IsInt() mileageLimit?: number;
  @IsEnum(CarType) carType: CarType;
  @IsEnum(EcoFriendly) ecoFriendly: EcoFriendly;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // parse JSON string to array
      } catch {
        return [value]; // fallback: wrap single string in array
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  features?: string[];
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // parse JSON string to array
      } catch {
        return [value]; // fallback: wrap single string in array
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  safety?: string[];
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // parse JSON string to array
      } catch {
        return [value]; // fallback: wrap single string in array
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  rules?: string[];

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() rejectionReason?: string;

  @IsOptional()
  @IsArray()
  photos: Express.Multer.File[];
}

export class CarSearchFilter {
  @IsOptional() @IsString() makeId?: string;
  @IsOptional() @IsString() modelId?: string;
  @IsOptional() @IsInt() year?: number;
  @IsOptional() @IsEnum(CarType) carType?: CarType;
  @IsOptional() @IsEnum(EcoFriendly) ecoFriendly?: EcoFriendly;
  @IsOptional() @IsNumber() minPrice?: number;
  @IsOptional() @IsNumber() maxPrice?: number;
}

export class AddCarInsuranceDto {
  @IsNotEmpty()
  @IsString()
  carId: string;

  @IsNotEmpty()
  @IsEnum(InsurancePlan)
  plan: InsurancePlan;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  coverageDetails?: string;
}

export class UpdateCarInsuranceDto {
  @IsOptional()
  @IsEnum(InsurancePlan)
  plan?: InsurancePlan;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  coverageDetails?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
