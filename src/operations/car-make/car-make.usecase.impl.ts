import { Injectable } from '@nestjs/common';
import { CarMakeRepository } from './car-make.repository';
import { CarMakeUsecase } from './car-make.usecase';
import { CarMakeDto, CarMakeUpdateDto } from './car-make.entity';

@Injectable()
export class CarMakeUseCasesImp implements CarMakeUsecase {
  constructor(private readonly repo: CarMakeRepository) {}

  async createCarMake(data: CarMakeDto) {
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

  async updateCarMake(id: string, data: CarMakeUpdateDto) {
    return this.repo.updateCarMake(id, data);
  }

  async deleteCarMake(id: string) {
    return this.repo.deleteCarMake(id);
  }
}
