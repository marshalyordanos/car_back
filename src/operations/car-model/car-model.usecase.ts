import { CarModel } from '@prisma/client';
import { CarModelDto, CarModelUpdateDto } from './car-model.entity';
import { ListQueryDto } from 'src/common/query/query.dto';

export interface CarModelUsecase {
  createCarModel(data: CarModelDto): Promise<CarModel>;
  getCarModel(id: string): Promise<CarModel | null>;
  getAllCarModels(
    payload: ListQueryDto,
  ): Promise<{ models: CarModel[]; pagination: any }>;
  updateCarModel(id: string, data: CarModelUpdateDto): Promise<CarModel>;
  deleteCarModel(id: string): Promise<CarModel>;
}
