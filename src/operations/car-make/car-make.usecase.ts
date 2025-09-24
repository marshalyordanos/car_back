import { CarMake } from '@prisma/client';
import { CarMakeDto, CarMakeUpdateDto } from './car-make.entity';

export interface CarMakeUsecase {
  createCarMake(data: CarMakeDto): Promise<CarMake>;
  getCarMake(id: string): Promise<CarMake | null>;
  getAllCarMakes(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ makes: CarMake[]; pagination: any }>;
  updateCarMake(id: string, data: CarMakeUpdateDto): Promise<CarMake>;
  deleteCarMake(id: string): Promise<CarMake>;
}
