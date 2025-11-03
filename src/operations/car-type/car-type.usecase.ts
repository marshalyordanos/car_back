import { CarMake } from '@prisma/client';
import { CarTypeDto, CarTypeUpdateDto } from './car-type.entity';

export interface CarMakeUsecase {
  createCarMake(data: CarTypeDto): Promise<CarMake>;
  getCarMake(id: string): Promise<CarMake | null>;
  getAllCarMakes(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ makes: CarMake[]; pagination: any }>;
  updateCarMake(id: string, data: CarTypeUpdateDto): Promise<CarMake>;
  deleteCarMake(id: string): Promise<CarMake>;
}
