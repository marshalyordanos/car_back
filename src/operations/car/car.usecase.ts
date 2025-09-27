import { Car, CarInsurance, CarMake, CarModel } from '@prisma/client';
import { CarDto, CarSearchFilter } from './car.entity';
import { ListQueryDto } from 'src/common/query/query.dto';

export interface CarUseCase {
  createCar(
    hostId: string,
    carData: CarDto,
    insurancePlans?: Partial<CarInsurance>[],
  ): Promise<Car>;

  updateCar(
    carId: string,
    hostId: string,
    carData: Partial<CarDto>,
  ): Promise<Car>;

  deleteCar(carId: string, hostId: string): Promise<void>;
  getCarById(carId: string): Promise<Car | null>;
  listCarsByHost(hostId: string): Promise<Car[]>;

  searchCars(filter: ListQueryDto);
  listAllCars(): Promise<Car[]>;
}
