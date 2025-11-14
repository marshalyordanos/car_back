import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarTypeUseCasesImp } from './car-typeusecase.impl';
import { CarTypeDto, CarTypeUpdateDto } from './car-type.entity';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { Public } from '../../common/decorator/public.decorator';
import * as permissionActionsEnum from '../../contracts/permission-actions.enum';
import { PermissionGuard } from '../../common/permission.guard';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';

@Controller()
export class CarTypeMessageController {
  constructor(private readonly usecases: CarTypeUseCasesImp) {}

  @Public()
  @MessagePattern(PATTERNS.CAR_Type_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const make = await this.usecases.getCarMake(payload.id);
      return IResponse.success('Car make fetched successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_Type_FIND_ALL)
  async findAll(
    @Payload() payload: { page: number; pageSize: number; search?: string },
  ) {
    try {
      const { page = 1, pageSize = 10, search } = payload;
      const result = await this.usecases.getAllCarMakes(page, pageSize, search);
      return IResponse.success(
        'Car makes fetched successfully',
        result.makes,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR TYPE', permissionActionsEnum.PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CAR_Type_CREATE)
  async create(@Payload() payload: { data: CarTypeDto }) {
    try {
      const make = await this.usecases.createCarMake(payload.data);
      return IResponse.success('Car make created successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR TYPE', permissionActionsEnum.PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CAR_Type_UPDATE)
  async update(@Payload() payload: { id: string; data: CarTypeUpdateDto }) {
    try {
      const make = await this.usecases.updateCarMake(payload.id, payload.data);
      return IResponse.success('Car make updated successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR TYPE', permissionActionsEnum.PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CAR_Type_DELETE)
  async delete(@Payload() payload: { id: string }) {
    try {
      const make = await this.usecases.deleteCarMake(payload.id);
      return IResponse.success('Car make deleted successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }
}
