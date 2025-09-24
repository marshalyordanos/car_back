import { Injectable } from '@nestjs/common';
import { CarModelRepository } from './car-model.repository';
import { CarModelUsecase } from './car-model.usecase';
import { CarModelDto, CarModelUpdateDto } from './car-model.entity';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class CarModelUseCasesImp implements CarModelUsecase {
  constructor(private readonly repo: CarModelRepository) {}

  async createCarModel(data: CarModelDto) {
    return this.repo.createCarModel(data);
  }

  async getCarModel(id: string) {
    return this.repo.findById(id);
  }

  async getAllCarModels(query: ListQueryDto) {
    const res = await this.repo.findAll(query);
    return {
      models: res.models,
      pagination: res.pagination,
    };
  }

  async updateCarModel(id: string, data: CarModelUpdateDto) {
    return this.repo.updateCarModel(id, data);
  }

  async deleteCarModel(id: string) {
    return this.repo.deleteCarModel(id);
  }
}
