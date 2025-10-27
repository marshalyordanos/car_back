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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarDto {
  @ApiProperty()
  @IsString()
  hostId: string;

  @ApiProperty()
  @IsString()
  makeId: string;

  @ApiProperty()
  @IsString()
  modelId: string;

  @ApiProperty({ example: 2022 })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsString()
  licensePlate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin: string;

  @ApiProperty({ enum: Transmission })
  @IsEnum(Transmission)
  transmission: Transmission;

  @ApiProperty({ example: 35000 })
  @Type(() => Number)
  @IsInt()
  mileage: number;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  dailyRate: number;

  @ApiProperty({ example: 45 })
  @Type(() => Number)
  @IsNumber()
  rentalPricePerDay: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  longTermDiscount?: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  seatingCapacity: number;

  @ApiPropertyOptional({ example: 200 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  mileageLimit?: number;

  @ApiProperty({ enum: CarType })
  @IsEnum(CarType)
  carType: CarType;

  @ApiProperty({ enum: EcoFriendly })
  @IsEnum(EcoFriendly)
  ecoFriendly: EcoFriendly;

  @ApiPropertyOptional({ example: '["Bluetooth","Camera"]' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiPropertyOptional({ example: '["Airbags","ABS"]' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  safety?: string[];

  @ApiPropertyOptional({ example: '["No smoking","No pets"]' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  rules?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  photos: Express.Multer.File[];
}

export class CarSearchFilter {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  makeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: CarType })
  @IsOptional()
  @IsEnum(CarType)
  carType?: CarType;

  @ApiPropertyOptional({ enum: EcoFriendly })
  @IsOptional()
  @IsEnum(EcoFriendly)
  ecoFriendly?: EcoFriendly;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}

export class AddCarInsuranceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  carId: string;

  @ApiProperty({ enum: InsurancePlan })
  @IsNotEmpty()
  @IsEnum(InsurancePlan)
  plan: InsurancePlan;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverageDetails?: string;
}

export class UpdateCarInsuranceDto {
  @ApiPropertyOptional({ enum: InsurancePlan })
  @IsOptional()
  @IsEnum(InsurancePlan)
  plan?: InsurancePlan;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverageDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CarDateDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

// import {
//   IsString,
//   IsInt,
//   IsOptional,
//   IsEnum,
//   IsArray,
//   IsNumber,
//   ArrayMinSize,
//   IsBoolean,
//   IsNotEmpty,
// } from 'class-validator';
// import {
//   CarType,
//   EcoFriendly,
//   InsurancePlan,
//   Transmission,
// } from '@prisma/client';
// import { Transform, Type } from 'class-transformer';

// export class CarDto {
//   @IsString() hostId: string;

//   @IsString() makeId: string;
//   @IsString() modelId: string;
//   @Type(() => Number) @IsInt() year: number;
//   @IsString() color: string;
//   @IsString() licensePlate: string;
//   @IsOptional() @IsString() vin: string;
//   @IsEnum(Transmission) transmission: Transmission;
//   @Type(() => Number) @IsInt() mileage: number;

//   @Type(() => Number) @IsNumber() dailyRate: number;
//   @Type(() => Number) @IsNumber() rentalPricePerDay: number;
//   @Type(() => Number) @IsOptional() @IsNumber() longTermDiscount?: number;

//   @Type(() => Number) @IsInt() seatingCapacity: number;
//   @Type(() => Number) @IsOptional() @IsInt() mileageLimit?: number;
//   @IsEnum(CarType) carType: CarType;
//   @IsEnum(EcoFriendly) ecoFriendly: EcoFriendly;

//   @Transform(({ value }) => {
//     if (typeof value === 'string') {
//       try {
//         return JSON.parse(value); // parse JSON string to array
//       } catch {
//         return [value]; // fallback: wrap single string in array
//       }
//     }
//     return value;
//   })
//   @IsOptional()
//   @IsArray()
//   features?: string[];
//   @Transform(({ value }) => {
//     if (typeof value === 'string') {
//       try {
//         return JSON.parse(value); // parse JSON string to array
//       } catch {
//         return [value]; // fallback: wrap single string in array
//       }
//     }
//     return value;
//   })
//   @IsOptional()
//   @IsArray()
//   safety?: string[];
//   @Transform(({ value }) => {
//     if (typeof value === 'string') {
//       try {
//         return JSON.parse(value); // parse JSON string to array
//       } catch {
//         return [value]; // fallback: wrap single string in array
//       }
//     }
//     return value;
//   })
//   @IsOptional()
//   @IsArray()
//   rules?: string[];

//   @IsOptional() @IsString() description?: string;
//   @IsOptional() @IsString() rejectionReason?: string;

//   @IsOptional()
//   @IsArray()
//   photos: Express.Multer.File[];
// }

// export class CarSearchFilter {
//   @IsOptional() @IsString() makeId?: string;
//   @IsOptional() @IsString() modelId?: string;
//   @IsOptional() @IsInt() year?: number;
//   @IsOptional() @IsEnum(CarType) carType?: CarType;
//   @IsOptional() @IsEnum(EcoFriendly) ecoFriendly?: EcoFriendly;
//   @IsOptional() @IsNumber() minPrice?: number;
//   @IsOptional() @IsNumber() maxPrice?: number;
// }

// export class AddCarInsuranceDto {
//   @IsNotEmpty()
//   @IsString()
//   carId: string;

//   @IsNotEmpty()
//   @IsEnum(InsurancePlan)
//   plan: InsurancePlan;

//   @IsNotEmpty()
//   @IsString()
//   provider: string;

//   @IsOptional()
//   @IsString()
//   coverageDetails?: string;
// }

// export class UpdateCarInsuranceDto {
//   @IsOptional()
//   @IsEnum(InsurancePlan)
//   plan?: InsurancePlan;

//   @IsOptional()
//   @IsString()
//   provider?: string;

//   @IsOptional()
//   @IsString()
//   coverageDetails?: string;

//   @IsOptional()
//   @IsBoolean()
//   isActive?: boolean;
// }
