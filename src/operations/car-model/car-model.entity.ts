import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CarModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  makeId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CarModelUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  makeId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
