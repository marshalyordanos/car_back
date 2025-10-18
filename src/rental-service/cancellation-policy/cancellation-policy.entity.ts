import { IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CancellationPolicyDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  userType: UserRole;

  @IsInt()
  @IsNotEmpty()
  daysBeforeTrip: number;

  @IsInt()
  @IsNotEmpty()
  refundPercent: number;
}

export class CancellationPolicyUpdateDto {
  @IsEnum(UserRole)
  @IsOptional()
  userType?: UserRole;

  @IsInt()
  @IsOptional()
  daysBeforeTrip?: number;

  @IsInt()
  @IsOptional()
  refundPercent?: number;
}
