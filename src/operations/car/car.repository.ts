import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Car, CarInsurance, CarMake, CarModel } from '@prisma/client';
import { CarDto, CarSearchFilter } from './car.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CarRepository {
  constructor(private prisma: PrismaService) {}

  async createCar(
    hostId: string,
    data: CarDto,
    photos?: string[],
  ): Promise<Car> {
    const host = await this.prisma.user.findUnique({
      where: { id: hostId },
    });
    if (!host) {
      throw new RpcException('Cannot create car: host does not exist');
    }

    return await this.prisma.car.create({
      data: {
        // Relations
        host: { connect: { id: hostId } },
        make: { connect: { id: data.makeId } },
        model: { connect: { id: data.modelId } },

        // Scalars
        year: data.year!,
        color: data.color!,
        licensePlate: data.licensePlate!,
        vin: data.vin ?? null,
        transmission: data.transmission!,
        mileage: data.mileage!,
        dailyRate: data.dailyRate!,
        rentalPricePerDay: data.rentalPricePerDay!,
        longTermDiscount: data.longTermDiscount ?? null,
        seatingCapacity: data.seatingCapacity!,
        mileageLimit: data.mileageLimit ?? null,
        carType: data.carType!,
        ecoFriendly: data.ecoFriendly ?? 'NONE',
        features: data.features ?? [],
        safety: data.safety ?? [],
        rules: data.rules ?? [],
        description: data.description ?? null,
        rejectionReason: data.rejectionReason ?? null,
        average_rating: 0,
        isActive: true,

        // Arrays
        photos: photos ?? [],

        // // Nested relations
        // insurancePlans: insurancePlans
        //   ? {
        //       create: insurancePlans.map((plan) => ({
        //         plan: plan.plan!,
        //         provider: plan.provider!,
        //         coverageDetails: plan.coverageDetails ?? '',
        //         isActive: plan.isActive ?? true,
        //       })),
        //     }
        //   : undefined,
      },
    });
  }

  async updateCar(
    carId: string,
    hostId: string,
    data: Partial<CarDto>,
    photos?: string[],
  ): Promise<Car> {
    // Pick out only scalar fields that exist in the Car model
    const {
      year,
      color,
      licensePlate,
      vin,
      transmission,
      mileage,
      dailyRate,
      rentalPricePerDay,
      longTermDiscount,
      seatingCapacity,
      mileageLimit,
      carType,
      ecoFriendly,
      features,
      safety,
      rules,
      description,
      rejectionReason,
    } = data;

    const updatedCar = await this.prisma.car.update({
      where: { id: carId },
      data: {
        // Scalars
        year: Number(data.year),
        mileage: Number(data.mileage),
        dailyRate: Number(data.dailyRate),
        rentalPricePerDay: Number(data.rentalPricePerDay),
        longTermDiscount: data.longTermDiscount
          ? Number(data.longTermDiscount)
          : null,
        seatingCapacity: Number(data.seatingCapacity),
        mileageLimit: data.mileageLimit ? Number(data.mileageLimit) : null,
        color: data.color,
        licensePlate: data.licensePlate,
        vin: data.vin,
        transmission: data.transmission,
        carType: data.carType,
        ecoFriendly: data.ecoFriendly,
        features: data.features ?? [],
        safety: data.safety ?? [],
        rules: data.rules ?? [],
        description: data.description ?? null,
        rejectionReason: data.rejectionReason ?? null,

        photos: photos ? (photos?.length > 1 ? photos : undefined) : undefined,

        // Relations
        host: { connect: { id: hostId } },
        make: data.makeId ? { connect: { id: data.makeId } } : undefined,
        model: data.modelId ? { connect: { id: data.modelId } } : undefined,
      },
    });

    return updatedCar;
  }

  async deleteCar(carId: string, hostId: string): Promise<void> {
    await this.prisma.car.delete({ where: { id: carId } });
  }

  async findById(carId: string): Promise<Car | null> {
    return this.prisma.car.findUnique({ where: { id: carId } });
  }

  async findByHost(hostId: string): Promise<Car[]> {
    return this.prisma.car.findMany({ where: { hostId } });
  }

  async searchCars(filter: CarSearchFilter): Promise<Car[]> {
    const where: any = {};

    if (filter.makeId) where.makeId = filter.makeId;
    if (filter.modelId) where.modelId = filter.modelId;
    if (filter.year) where.year = filter.year;
    if (filter.carType) where.carType = filter.carType;
    if (filter.ecoFriendly) where.ecoFriendly = filter.ecoFriendly;
    if (filter.minPrice || filter.maxPrice) {
      where.dailyRate = {};
      if (filter.minPrice) where.dailyRate.gte = filter.minPrice;
      if (filter.maxPrice) where.dailyRate.lte = filter.maxPrice;
    }

    return this.prisma.car.findMany({ where });
  }

  async listAllCars(): Promise<Car[]> {
    return this.prisma.car.findMany();
  }

  async addInsurance(data: any) {
    return this.prisma.carInsurance.create({ data });
  }

  async updateInsurance(id: string, data: any) {
    return this.prisma.carInsurance.update({
      where: { id },
      data,
    });
  }

  async deleteInsurance(id: string) {
    return this.prisma.carInsurance.delete({ where: { id } });
  }

  async getByCar(carId: string) {
    return this.prisma.carInsurance.findMany({
      where: { carId },
    });
  }
}
