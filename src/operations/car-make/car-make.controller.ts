import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarMakeUseCasesImp } from './car-make.usecase.impl';
import { CarMakeDto, CarMakeUpdateDto } from './car-make.entity';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { Public } from '../../common/decorator/public.decorator';
import { CheckPermission } from 'src/common/decorator/check-permission.decorator';
import { PermissionActions } from 'src/contracts/permission-actions.enum';
import { PermissionGuard } from 'src/common/permission.guard';

@Controller()
export class CarMakeMessageController {
  constructor(private readonly usecases: CarMakeUseCasesImp) {}

  @Public()
  @MessagePattern(PATTERNS.CAR_MAKE_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const make = await this.usecases.getCarMake(payload.id);
      return IResponse.success('Car make fetched successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_MAKE_FIND_ALL)
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
  @CheckPermission('CAR BRAND', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CAR_MAKE_CREATE)
  async create(@Payload() payload: { data: CarMakeDto }) {
    try {
      const make = await this.usecases.createCarMake(payload.data);
      return IResponse.success('Car make created successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR BRAND', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CAR_MAKE_UPDATE)
  async update(@Payload() payload: { id: string; data: CarMakeUpdateDto }) {
    try {
      const make = await this.usecases.updateCarMake(payload.id, payload.data);
      return IResponse.success('Car make updated successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CAR BRAND', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CAR_MAKE_DELETE)
  async delete(@Payload() payload: { id: string }) {
    try {
      const make = await this.usecases.deleteCarMake(payload.id);
      return IResponse.success('Car make deleted successfully', make);
    } catch (error) {
      handleCatch(error);
    }
  }
}
