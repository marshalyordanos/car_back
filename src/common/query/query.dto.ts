import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // Example: "name:toyota,brand:toyota"

  @IsOptional()
  @IsString()
  sort?: string; // Example: "price:1,name:-1"

  @IsOptional()
  @IsString()
  filter?: string; // Example: "price_lte:100,status:approved"
}
