import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'name:toyota,brand:toyota',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort string',
    example: 'price:1,name:-1',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Filter string',
    example: 'price_lte:100,status:approved',
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
