import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CarMake, Prisma } from '@prisma/client';

@Injectable()
export class CarMakeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCarMake(data: Prisma.CarMakeCreateInput): Promise<CarMake> {
    return this.prisma.carMake.create({ data });
  }

  async findById(id: string): Promise<CarMake | null> {
    return this.prisma.carMake.findUnique({ where: { id } });
  }

  async findAll(
    skip: number,
    take: number,
    where?: any,
  ): Promise<[CarMake[], number]> {
    const [makes, total] = await Promise.all([
      this.prisma.carMake.findMany({
        skip,
        take,
        where,
        include: { models: true },
      }),
      this.prisma.carMake.count({ where }),
    ]);
    return [makes, total];
  }

  async updateCarMake(
    id: string,
    data: Prisma.CarMakeUpdateInput,
  ): Promise<CarMake> {
    console.log('carudpated');
    return this.prisma.carMake.update({ where: { id }, data });
  }

  async deleteCarMake(id: string): Promise<CarMake> {
    return this.prisma.carMake.delete({ where: { id } });
  }
}
