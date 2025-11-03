import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CarMake, Prisma } from '@prisma/client';

@Injectable()
export class CarTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCarMake(data: Prisma.CarTypeCreateInput): Promise<CarMake> {
    return this.prisma.carType.create({ data });
  }

  async findById(id: string): Promise<CarMake | null> {
    return this.prisma.carType.findUnique({ where: { id } });
  }

  async findAll(
    skip: number,
    take: number,
    where?: any,
  ): Promise<[CarMake[], number]> {
    const [makes, total] = await Promise.all([
      this.prisma.carType.findMany({
        skip,
        take,
        where,
      }),
      this.prisma.carType.count({ where }),
    ]);
    return [makes, total];
  }

  async updateCarMake(
    id: string,
    data: Prisma.CarTypeUpdateInput,
  ): Promise<CarMake> {
    console.log('carudpated');
    return this.prisma.carType.update({ where: { id }, data });
  }

  async deleteCarMake(id: string): Promise<CarMake> {
    return this.prisma.carType.delete({ where: { id } });
  }
}
