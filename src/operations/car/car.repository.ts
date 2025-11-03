import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Car, CarInsurance, CarMake, CarModel } from '@prisma/client';
import { CarDto, CarSearchFilter } from './car.entity';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

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
        carType: { connect: { id: data.carType } },

        // Scalars
        year: data.year!,
        color: data.color!,
        licensePlate: data.licensePlate!,
        vin: data.vin ?? null,
        transmission: data.transmission!,
        mileage: data.mileage!,
        dailyRate: 0,
        location: data?.location,
        rentalPricePerDay: data.rentalPricePerDay!,
        longTermDiscount: data.longTermDiscount ?? null,
        seatingCapacity: data.seatingCapacity!,
        mileageLimit: data.mileageLimit ?? null,
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
    const existingCar = await this.prisma.car.findUnique({
      where: { id: carId },
    });
    console.log('Existing car:', existingCar);

    console.log('-------------------', carId, data);
    const updatedCar = await this.prisma.car.update({
      where: { id: carId },
      data: {
        // Scalars
        year: Number(data.year),
        mileage: Number(data.mileage),
        dailyRate: Number(0),
        location: data?.location,
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
        ecoFriendly: data.ecoFriendly,
        features: data.features ?? [],
        safety: data.safety ?? [],
        rules: data.rules ?? [],
        description: data.description ?? null,
        rejectionReason: data.rejectionReason ?? null,

        photos: photos ? (photos?.length > 1 ? photos : undefined) : undefined,

        // Relationsa
        // host: { connect: { id: hostId } },
        make: data.makeId ? { connect: { id: data.makeId } } : undefined,
        model: data.modelId ? { connect: { id: data.modelId } } : undefined,
        carType: data.carType ? { connect: { id: data.carType } } : undefined,
      },
    });

    return updatedCar;
  }

  async deleteCar(carId: string, hostId: string): Promise<void> {
    await this.prisma.car.delete({ where: { id: carId } });
  }

  // async findById(carId: string,startDate:string,endDate:string): Promise<Car | null> {
  //   return this.prisma.car.findUnique({
  //     where: { id: carId },
  //     include: {
  //       make: true,
  //       model: true,
  //       insurancePlans: true,
  //       reviews: true,
  //       host: true,
  //       bookings: {
  //         where: {
  //           status: 'PENDING',
  //         },
  //         select: {
  //           id: true,
  //           startDate: true,
  //           endDate: true,
  //         },
  //       },
  //     },
  //   });
  // }
  async findById(carId: string, startDate?: string, endDate?: string) {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
      include: {
        make: true,
        model: true,
        insurancePlans: true,
        reviews: true,
        host: true,
        carType: true,
        bookings: {
          where: { status: 'PENDING' },
          select: { id: true, startDate: true, endDate: true },
        },
      },
    });

    if (!car) return null;

    // --- pricing compute ---
    let baseTotal = 0;
    let totalPrice = 0;
    let days = 0;

    let tax = 0;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
        const diffTime = end.getTime() - start.getTime();
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const carPrice = car.rentalPricePerDay * days;

        const platformFee = carPrice * 0.1;
        baseTotal = carPrice + platformFee;
        tax = baseTotal * 0.15;
        totalPrice = baseTotal + tax;
      }
    }

    return {
      ...car,
      baseTotal,
      totalPrice,
      days,
      tax,
    };
  }

  async findByHost(hostId: string): Promise<Car[]> {
    return this.prisma.car.findMany({ where: { hostId } });
  }

  async searchCars(filter: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: ['make.name', 'model.name', 'host.phone', 'host.email'],
    });
    const query = feature.getQuery();
    const where: any = { ...query.where };

    // Declare with let at top
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let days = 0;

    console.log(filter);
    if (filter.startDate && filter.endDate) {
      startDate = new Date(filter.startDate);
      endDate = new Date(filter.endDate);

      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        startDate < endDate
      ) {
        const diffTime = endDate.getTime() - startDate.getTime();
        console.log('==================: ', startDate, endDate);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        where.AND = where.AND || [];
        where.AND.push({
          bookings: {
            none: {
              AND: [
                {
                  status: {
                    notIn: [
                      'CANCELLED_BY_GUEST',
                      'CANCELLED_BY_HOST',
                      'CANCELLED_BY_ADMIN',
                      'COMPLETED',
                      'REJECTED',
                    ],
                  },
                },
                {
                  OR: [
                    {
                      startDate: { lte: endDate },
                      endDate: { gte: startDate },
                    },
                  ],
                },
              ],
            },
          },
        });
      }
    }

    const results = await Promise.all([
      this.prisma.car.findMany({
        ...{ ...query, where },
        include: {
          make: true,
          model: true,
          carType: true,
        },
      }),
      this.prisma.car.count({ where }),
    ]);

    const cars = results[0] || [];
    const total = results[1] || 0;

    console.log('dayesss: ', days);
    console.log('+===================================:', days);

    const carsWithPricing = cars.map((car) => {
      if (days > 0) {
        const carPrice = car.rentalPricePerDay * days;

        const platformFee = carPrice * 0.1;
        const baseTotal = carPrice + platformFee;
        const tax = baseTotal * 0.15;
        const totalPrice = baseTotal + tax;

        console.log(
          '+===================================:',
          platformFee,
          baseTotal,
          tax,
          totalPrice,
        );
        return { ...car, baseTotal, totalPrice, days };
      }
      return { ...car, baseTotal: 0, totalPrice: 0, days: 0 };
    });

    return {
      models: carsWithPricing,
      pagination: feature.getPagination(total),
    };
  }

  // async searchCars(filter: ListQueryDto) {
  //   const feature = new PrismaQueryFeature({
  //     search: filter.search,
  //     filter: filter.filter,
  //     sort: filter.sort,
  //     page: filter.page,
  //     pageSize: filter.pageSize,
  //     searchableFields: ['name'],
  //   });
  //   const query = feature.getQuery();
  //   const where: any = {
  //     ...query.where,
  //   };

  //   console.log(filter);
  //   // Declare with let at top
  //   let startDate2: Date | null = null;
  //   let endDate2: Date | null = null;
  //   let days = 0;

  //   if (filter.startDate && filter.endDate) {
  //     startDate2 = new Date(filter.startDate);
  //     endDate2 = new Date(filter.endDate);

  //     const diffTime = endDate2.getTime() - startDate2.getTime();
  //     days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //     const startDate = new Date(filter.startDate);
  //     const endDate = new Date(filter.endDate);

  //     where.AND = where.AND || [];

  //     where.AND.push({
  //       bookings: {
  //         none: {
  //           AND: [
  //             {
  //               status: {
  //                 notIn: [
  //                   'CANCELLED_BY_GUEST',
  //                   'CANCELLED_BY_HOST',
  //                   'CANCELLED_BY_ADMIN',
  //                   'COMPLETED',
  //                   'REJECTED',
  //                 ],
  //               },
  //             },
  //             {
  //               OR: [
  //                 {
  //                   startDate: { lte: endDate },
  //                   endDate: { gte: startDate },
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     });
  //   }

  //   console.log(JSON.stringify(where, null, 2));

  //   const results = await Promise.all([
  //     this.prisma.car.findMany({
  //       ...{ ...query, where: where },

  //       include: {
  //         make: true,
  //         model: true,
  //       },
  //     }),
  //     this.prisma.car.count({ where }),
  //   ]);

  //   const models = results[0] || [];
  //   const total = results[1] || 0;
  //   const carsWithPricing = models.map((car) => {
  //     if (days > 0) {
  //       const baseTotal = car.rentalPricePerDay * days;
  //       const platformFee = baseTotal * 0.1;
  //       const tax = baseTotal * 0.15;
  //       const totalPrice = baseTotal + platformFee + tax;
  //       return { ...car, baseTotal, totalPrice };
  //     }
  //     return { ...car, baseTotal: 0, totalPrice: 0 };
  //   });
  //   return {
  //     models,
  //     pagination: feature.getPagination(total),
  //   };
  // }

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

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}
