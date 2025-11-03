import { Injectable } from '@nestjs/common';
import { CarTypeRepository } from './car-type.repository';
import { CarTypeDto, CarTypeUpdateDto } from './car-type.entity';

@Injectable()
export class CarTypeUseCasesImp {
  constructor(private readonly repo: CarTypeRepository) {}

  async createCarMake(data: CarTypeDto) {
    return this.repo.createCarMake(data);
  }

  async getCarMake(id: string) {
    return this.repo.findById(id);
  }

  async getAllCarMakes(page: number, pageSize: number, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [makes, total] = await this.repo.findAll(skip, pageSize, where);
    return {
      makes,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateCarMake(id: string, data: CarTypeUpdateDto) {
    return this.repo.updateCarMake(id, data);
  }

  async deleteCarMake(id: string) {
    return this.repo.deleteCarMake(id);
  }
}
