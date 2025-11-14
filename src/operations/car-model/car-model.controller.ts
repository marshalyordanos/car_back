import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarModelUseCasesImp } from './car-model.usecase.impl';
import { CarModelDto, CarModelUpdateDto } from './car-model.entity';

import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { ListQueryDto } from '../../common/query/query.dto';
import { Public } from '../../common/decorator/public.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class CarModelMessageController {
  constructor(private readonly usecases: CarModelUseCasesImp) {}

  @Public()
  @MessagePattern(PATTERNS.CAR_MODEL_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const model = await this.usecases.getCarModel(payload.id);
      return IResponse.success('Car model fetched successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_MODEL_FIND_ALL)
  async findAll(data: { query: ListQueryDto }) {
    try {
      const result = await this.usecases.getAllCarModels(data.query);
      return IResponse.success(
        'Car models fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR MODEL', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CAR_MODEL_CREATE)
  async create(@Payload() payload: { data: CarModelDto }) {
    try {
      const model = await this.usecases.createCarModel(payload.data);
      return IResponse.success('Car model created successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR MODEL', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CAR_MODEL_UPDATE)
  async update(@Payload() payload: { id: string; data: CarModelUpdateDto }) {
    try {
      const model = await this.usecases.updateCarModel(
        payload.id,
        payload.data,
      );
      return IResponse.success('Car model updated successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR MODEL', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CAR_MODEL_DELETE)
  async delete(@Payload() payload: { id: string }) {
    try {
      const model = await this.usecases.deleteCarModel(payload.id);
      return IResponse.success('Car model deleted successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }
}
