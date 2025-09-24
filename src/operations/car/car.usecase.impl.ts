import { Injectable } from '@nestjs/common';
import { Car, CarInsurance, CarMake, CarModel } from '@prisma/client';
import { CarUseCase } from './car.usecase';
import { CarRepository } from './car.repository';
import {
  AddCarInsuranceDto,
  CarDto,
  CarSearchFilter,
  UpdateCarInsuranceDto,
} from './car.entity';
import { uploadToCloudinary } from '../../config/cloudinary/upload';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CarUseCasesImp implements CarUseCase {
  constructor(private readonly repo: CarRepository) {}

  async createCar(hostId: string, carData: CarDto): Promise<Car> {
    if (!Array.isArray(carData?.photos) || carData.photos.length < 2) {
      throw new RpcException('You must upload at least 4 photos.');
    }

    let uploadedFiles: string[] = [];

    try {
      if (carData.photos) {
        uploadedFiles = await Promise.all(
          carData.photos.map((file) =>
            uploadToCloudinary(file, 'users/profilePhotos'),
          ),
        );
      }
    } catch (err) {
      throw new RpcException('Error uploading files to Cloudinary');
    }

    console.log({ uploadedFiles, carData, hostId });

    return this.repo.createCar(hostId, carData, uploadedFiles);
  }

  async updateCar(
    carId: string,
    hostId: string,
    carData: Partial<CarDto>,
  ): Promise<Car> {
    if (Array.isArray(carData?.photos) && carData.photos.length < 2) {
      throw new RpcException('You must upload at least 4 photos.');
    }

    let uploadedFiles: string[] = [];

    try {
      if (carData.photos) {
        uploadedFiles = await Promise.all(
          carData.photos.map((file) =>
            uploadToCloudinary(file, 'users/profilePhotos'),
          ),
        );
      }
    } catch (err) {
      throw new RpcException('Error uploading files to Cloudinary');
    }

    console.log({ uploadedFiles, carData, hostId });
    return this.repo.updateCar(carId, hostId, carData, uploadedFiles);
  }

  async deleteCar(carId: string, hostId: string): Promise<void> {
    return this.repo.deleteCar(carId, hostId);
  }

  async getCarById(carId: string): Promise<Car | null> {
    return this.repo.findById(carId);
  }

  async listCarsByHost(hostId: string): Promise<Car[]> {
    return this.repo.findByHost(hostId);
  }

  async searchCars(filter: CarSearchFilter): Promise<Car[]> {
    return this.repo.searchCars(filter);
  }

  async listAllCars(): Promise<Car[]> {
    return this.repo.listAllCars();
  }

  async addInsurance(dto: AddCarInsuranceDto) {
    return this.repo.addInsurance(dto);
  }

  async updateInsurance(id: string, dto: UpdateCarInsuranceDto) {
    return this.repo.updateInsurance(id, dto);
  }

  async deleteInsurance(id: string) {
    return this.repo.deleteInsurance(id);
  }

  async getByCar(carId: string) {
    return this.repo.getByCar(carId);
  }
}
