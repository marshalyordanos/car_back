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
import { uploadToSpaces } from '../../config/cloudinary/upload';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class CarUseCasesImp {
  constructor(private readonly repo: CarRepository) {}

  async createCar(
    hostId: string,
    carData: CarDto,
    photos: string[],
    otherFiles: any,
  ): Promise<Car> {
    // if (!Array.isArray(carData?.photos) || carData.photos.length < 2) {
    //   throw new RpcException('You must upload at least 4 photos.');
    // }

    // try {
    //   if (carData.photos) {
    //     uploadedFiles = await Promise.all(
    //       carData.photos.map((file) => uploadToSpaces(file, 'cars/')),
    //     );
    //   }
    //   if (carData.technicalInspectionCertificate) {
    //     uploadedFiles2.technicalInspectionCertificate = await uploadToSpaces(
    //       carData.technicalInspectionCertificate,
    //       'cars/technicalInspectionCertificate',
    //     );
    //   }
    //   if (carData.gpsInstallationReceipt) {
    //     uploadedFiles2.gpsInstallationReceipt = await uploadToSpaces(
    //       carData.gpsInstallationReceipt,
    //       'cars/gpsInstallationReceipt',
    //     );
    //   }
    // } catch (err) {
    //   console.log('space error: ', err);

    //   throw new RpcException('Error uploading files to Cloudinary');
    // }

    // console.log({ photos, carData, hostId });

    return this.repo.createCar(hostId, carData, photos, otherFiles);
  }
  async updateCar(
    carId: string,
    hostId: string,
    carData: Partial<CarDto>,
    userId: string,
    photos: string[],
    otherFiles: any,
  ) {
    const car = await this.repo.findById(carId);
    const user = await this.repo.findUserById(userId);

    console.log(car?.hostId, userId);
    if (car?.hostId != userId && !user?.isSuperAdmin) {
      throw new RpcException('You have not a permission to update this car.');
    }

    // if (Array.isArray(carData?.photos) && carData.photos.length < 6) {
    //   throw new RpcException('You must upload at least 6 photos.');
    // }

    console.log('000000000000000000000000000000: ', photos, otherFiles);
    // try {
    //   if (carData.photos) {
    //     uploadedFiles = await Promise.all(
    //       carData.photos.map((file) => uploadToSpaces(file, 'cars/')),
    //     );
    //   }
    //   if (carData.technicalInspectionCertificate) {
    //     uploadedFiles2.technicalInspectionCertificate = await uploadToSpaces(
    //       carData.technicalInspectionCertificate,
    //       'cars/technicalInspectionCertificate',
    //     );
    //   }
    //   if (carData.gpsInstallationReceipt) {
    //     uploadedFiles2.gpsInstallationReceipt = await uploadToSpaces(
    //       carData.gpsInstallationReceipt,
    //       'cars/gpsInstallationReceipt',
    //     );
    //   }
    // } catch (err) {
    //   throw new RpcException('Error uploading files to Cloudinary');
    // }

    console.log({ photos, carData, hostId });
    return this.repo.updateCar(carId, hostId, carData, photos, otherFiles);
  }

  async deleteCar(
    carId: string,
    hostId: string,
    userId: string,
  ): Promise<void> {
    const car = await this.repo.findById(carId);

    if (car?.hostId == userId) {
      throw new RpcException('You have not a permission to delete this car.');
    }
    return this.repo.deleteCar(carId, hostId);
  }

  async getCarById(carId: string, startDate: string, endDate: string) {
    return this.repo.findById(carId, startDate, endDate);
  }

  async listCarsByHost(hostId: string): Promise<Car[]> {
    return this.repo.findByHost(hostId);
  }

  async searchCars(filter: ListQueryDto) {
    return this.repo.searchCars(filter);
  }
  async searchCarsAdmin(filter: ListQueryDto, userId: string) {
    const user = await this.repo.findUserById(userId);

    if (user?.role?.name === 'HOST') {
      // Ensure filter is a string
      const currentFilter = filter.filter ?? '';

      if (/hostId:[^,]*/.test(currentFilter)) {
        filter.filter = currentFilter.replace(
          /hostId:[^,]*/,
          `hostId:${userId}`,
        );
      } else {
        filter.filter = currentFilter
          ? currentFilter + `,hostId:${userId}`
          : `hostId:${userId}`;
      }
    }

    return this.repo.searchCars(filter);
  }

  async listAllCars(): Promise<Car[]> {
    return this.repo.listAllCars();
  }

  async addInsurance(dto: AddCarInsuranceDto) {
    const uploaded: any = {};

    try {
      if (dto.documentFile) {
        uploaded.documentFile = await uploadToSpaces(
          dto.documentFile,
          'cars/insuranceDocs',
        );
      }
    } catch (err) {
      console.log('space error: ', err);
      throw new RpcException('Error uploading document to space');
    }

    return this.repo.addInsurance({
      carId: dto.carId,
      insuranceCompany: dto.insuranceCompany,
      policyNumber: dto.policyNumber,
      expiryDate: new Date(dto.expiryDate),
      insuranceType: dto.insuranceType,
      documentFile: uploaded.documentFile || null,
    });
  }

  async updateInsurance(id: string, dto: UpdateCarInsuranceDto) {
    const uploaded: any = {};

    try {
      if (dto.documentFile) {
        uploaded.documentFile = await uploadToSpaces(
          dto.documentFile,
          'cars/insuranceDocs',
        );
      }
    } catch (err) {
      throw new RpcException('Error uploading document to space');
    }

    return this.repo.updateInsurance(id, {
      ...dto,
      ...(uploaded.documentFile && { documentFile: uploaded.documentFile }),
      ...(dto.expiryDate && { expiryDate: new Date(dto.expiryDate) }),
    });
  }

  async deleteInsurance(id: string) {
    return this.repo.deleteInsurance(id);
  }

  async getByCar(carId: string) {
    return this.repo.getByCar(carId);
  }
}
