import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CarMakeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CarMakeUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
