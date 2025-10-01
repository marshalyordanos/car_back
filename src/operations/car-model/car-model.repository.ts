import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CarModel, Prisma } from '@prisma/client';
import { CarModelDto } from './car-model.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class CarModelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCarModel(dto: CarModelDto): Promise<CarModel> {
    return await this.prisma.carModel.create({
      data: {
        name: dto.name,
        isActive: dto.isActive ?? true,
        make: {
          connect: { id: dto.makeId }, // <-- THIS is required
        },
      },
    });
  }

  async findById(id: string): Promise<CarModel | null> {
    return this.prisma.carModel.findUnique({
      where: { id },
      include: { make: true },
    });
  }

  async findAll(filter: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: ['name', 'make.name'],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.carModel.findMany({
        ...query,
        include: { make: true },
        where: query.where || {},
      }),
      this.prisma.carModel.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async updateCarModel(
    id: string,
    data: Prisma.CarModelUpdateInput,
  ): Promise<CarModel> {
    console.log('----------------------------:models: ', id, data);
    return this.prisma.carModel.update({ where: { id }, data });
  }

  async deleteCarModel(id: string): Promise<CarModel> {
    return this.prisma.carModel.delete({ where: { id } });
  }
}
