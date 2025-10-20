import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({ description: 'Resource name' })
  @IsString()
  @IsNotEmpty({ message: 'Resource is required!!' })
  resource: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class RoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [PermissionDto] })
  @IsArray()
  @IsOptional()
  permissions: PermissionDto[];
}

// DTOs
export class PermissionActionDto {
  @ApiProperty({ description: 'Permission ID' })
  @IsString()
  permissionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createAction?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readAction?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  updateAction?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deleteAction?: boolean;
}

export class ChangeRolePermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsString()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @ApiPropertyOptional({ type: [PermissionActionDto] })
  @IsOptional()
  @ValidateNested({ each: true }) // important for arrays of objects
  @Type(() => PermissionActionDto) // tells class-transformer how to transform nested objects
  permissions?: PermissionActionDto[];
}

export class AssignUserRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Role ID' })
  @IsNotEmpty()
  @IsString()
  roleId: string;
}
