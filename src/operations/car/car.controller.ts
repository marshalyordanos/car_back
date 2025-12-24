import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarUseCasesImp } from './car.usecase.impl';
import { PATTERNS } from '../../contracts';
import {
  CarSearchFilter,
  CarDto,
  AddCarInsuranceDto,
  UpdateCarInsuranceDto,
} from './car.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { ListQueryDto } from '../../common/query/query.dto';
import { Public } from '../../common/decorator/public.decorator';
import * as permissionGuard from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';

@Controller()
export class CarMessageController {
  constructor(private readonly usecases: CarUseCasesImp) {}

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CAR_CREATE)
  async createCar(
    @Payload()
    payload: {
      hostId: string;
      carData: CarDto;
      photos: string[];
      otherFiles: any;
    },
  ) {
    try {
      const car = await this.usecases.createCar(
        payload.hostId,
        payload.carData,
        payload.photos,
        payload.otherFiles,
      );
      console.log(
        '8888888888888888888888888888888888888888888888888883333333333333333333: : ',
        car,
      );
      return IResponse.success('Car added successfully', car);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CAR_UPDATE)
  async updateCar(
    @Payload()
    payload: {
      carId: string;
      hostId: string;
      carData: Partial<CarDto>;
      user: any;
      photos: string[];
      otherFiles: any;
    },
  ) {
    try {
      const car = await this.usecases.updateCar(
        payload.carId,
        payload.hostId,
        payload.carData,
        payload.user?.sub,
        payload.photos,
        payload.otherFiles,
      );
      return IResponse.success('Car updated successfully', car);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CAR_DELETE)
  async deleteCar(
    @Payload() payload: { carId: string; hostId: string; user: any },
  ) {
    try {
      const car = await this.usecases.deleteCar(
        payload.carId,
        payload.hostId,
        payload.user?.sub,
      );
      return IResponse.success('Car deleted successfully', car);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_FIND_BY_ID)
  async findByIdCar(
    @Payload() payload: { carId: string; startDate: string; endDate: string },
  ) {
    try {
      const car = await this.usecases.getCarById(
        payload.carId,
        payload.startDate,
        payload.endDate,
      );
      return IResponse.success('car fetched successfully', car);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_FIND_ALL)
  findAllCar() {
    return this.usecases.listAllCars();
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_SEARCH)
  async searchCar(@Payload() payload: { query: ListQueryDto }) {
    try {
      const res = await this.usecases.searchCars(payload.query);
      return IResponse.success(
        'Car fetched successfully',
        res.models,
        res.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.READ)
  @MessagePattern(PATTERNS.CAR_SEARCH_ADMIN)
  async searchCarAdmin(@Payload() payload: { user: any; query: ListQueryDto }) {
    try {
      const res = await this.usecases.searchCarsAdmin(
        payload.query,
        payload.user.sub,
      );
      return IResponse.success(
        'Car fetched successfully',
        res.models,
        res.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CAR_INSURANCE_ADD)
  async addInsurance(@Payload() payload: { data: AddCarInsuranceDto }) {
    try {
      const res = await this.usecases.addInsurance(payload.data);
      return IResponse.success('Car insurance added successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CAR_INSURANCE_UPDATE)
  async updateInsurance(
    @Payload() payload: { id: string; data: UpdateCarInsuranceDto },
  ) {
    try {
      const res = await this.usecases.updateInsurance(payload.id, payload.data);
      return IResponse.success('Car insurance updated successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('CAR', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CAR_INSURANCE_DELETE)
  async deleteInsurance(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.deleteInsurance(payload.id);
      return IResponse.success('Car insurance deleted successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CAR_INSURANCE_GET_BY_CAR)
  async getByCar(@Payload() payload: { carId: string }) {
    try {
      const res = await this.usecases.getByCar(payload.carId);
      return IResponse.success('Car insurance fetched successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }
}
