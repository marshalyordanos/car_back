import { IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancellationPolicyDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  userType: UserRole;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  daysBeforeTrip: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  refundPercent: number;
}

export class CancellationPolicyUpdateDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  userType?: UserRole;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  daysBeforeTrip?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  refundPercent?: number;
}
