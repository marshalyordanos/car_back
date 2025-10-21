import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import {
  ChangeRoleDto,
  HostProfileDto,
  HostVerifyDto,
  IsActiveDto,
  UserCreteDto,
  UserDto,
} from './user.entity';
import { Public } from '../../common/decorator/public.decorator';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import * as permissionGuard from '../../common/permission.guard';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { ListQueryDto } from 'src/common/query/query.dto';

@Controller()
export class UserMessageController {
  constructor(private readonly usecases: UserUseCasesImp) {}

  @Public()
  @MessagePattern(PATTERNS.CREATE_HOST_USER)
  async creatHost(@Payload() dto: any) {
    try {
      const user = await this.usecases.createHost(dto);
      return new IResponse(true, 'User is registered Succuessfuly', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  // @Public()
  @MessagePattern(PATTERNS.USER_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const user = await this.usecases.getUser(payload.id);
      return IResponse.success('Fetch user successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  // @Public()
  @MessagePattern(PATTERNS.USER_FIND_ALL)
  async findAll(@Payload() data: { query: ListQueryDto }) {
    try {
      // const user = data.user;
      // console.log('Current user:', user);

      const result = await this.usecases.getAllUsers(data.query);

      return IResponse.success(
        'Users fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.CUSTOMER_FIND_ALL)
  async findAllCustomers(@Payload() data: { query: ListQueryDto }) {
    try {
      // const user = data.user;
      // console.log('Current user:', user);

      const result = await this.usecases.getAllCustomers(data.query);

      return IResponse.success(
        'Rentals fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_CREATE)
  async create(@Payload() payload: { data: UserCreteDto }) {
    try {
      const model = await this.usecases.createUser(payload.data);
      return IResponse.success('User model created successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.HOST_FIND_ALL)
  async findAllHosts(@Payload() data: { query: ListQueryDto }) {
    try {
      // const user = data.user;
      // console.log('Current user:', user);

      const result = await this.usecases.getAllHosts(data.query);

      return IResponse.success(
        'Hosts fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_UPDATE)
  async update(@Payload() payload: { id: string; data: Partial<UserDto> }) {
    try {
      const user = await this.usecases.updateUser(payload.id, payload.data);
      return IResponse.success(' user updated successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  // @Public()
  @MessagePattern(PATTERNS.USER_FIND_ME_BY_ID)
  async findMeById(@Payload() payload: { id: string; user: any }) {
    try {
      console.log('abababadshj:', payload.user);
      const user = await this.usecases.getUser(
        payload.id,
        true,
        payload.user?.sub,
      );
      return IResponse.success('Fetch user successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_UPDATE_ME)
  async updateMe(
    @Payload() payload: { id: string; data: Partial<UserDto>; user: any },
  ) {
    try {
      const user = await this.usecases.updateUser(
        payload.id,
        payload.data,
        true,
        payload.user?.sub,
      );
      return IResponse.success(' user updated successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('HOST_PROFILE', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.USER_UPDATE_HOST_PROFILE)
  async updateHostProfile(
    @Payload() payload: { id: string; data: HostProfileDto },
  ) {
    try {
      const user = await this.usecases.updateHostProfile(
        payload.id,
        payload.data,
      );
      return IResponse.success(' user profile Updated successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_VERIFY_HOST_PROFILE)
  async verifyHostProfile(
    @Payload() payload: { id: string; data: HostVerifyDto },
  ) {
    try {
      const user = await this.usecases.verifyHostProfile(
        payload.id,
        payload.data.isVerified,
      );
      return IResponse.success(' Host is verified  successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.ACTIVE_DISACTIVE_USER)
  async activeOrDiactiveUser(
    @Payload() payload: { id: string; data: IsActiveDto },
  ) {
    try {
      const user = await this.usecases.activeOrDiactiveUser(
        payload.id,
        payload.data.isActive,
      );
      return IResponse.success(' Host is verified  successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_DELETE)
  async deleteUser(@Payload() payload: { id: string }) {
    try {
      const user = await this.usecases.deleteUser(payload.id);
      return IResponse.success(' user deleted successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  //Get user by email
  @Public()
  @MessagePattern(PATTERNS.USER_FIND_BY_EMAIL)
  async findByEmail(@Payload() payload: { email: string }) {
    try {
      return this.usecases.findUserByEmail(payload.email);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.GUEST_ADD_WISHLIST)
  async addToWishlist(@Payload() payload: { user: any; carId: string }) {
    try {
      console.log('wishshshshshshs', payload.user);

      const res = await this.usecases.addToWishlist(
        payload.user.sub,
        payload.carId,
      );
      return IResponse.success(' car is added to wish list successfully', res);
    } catch (error) {
      console.log(error);

      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.GUEST_REMOVE_WISHLIST)
  async removeFromWishlist(@Payload() payload: { user: any; carId: string }) {
    try {
      const res = await this.usecases.removeFromWishlist(
        payload.user.sub,
        payload.carId,
      );
      return IResponse.success(
        ' car is removed from wish list successfully',
        res,
      );
    } catch (error) {
      console.log(error);
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.GUEST_GET_WISHLIST)
  async getWishlist(@Payload() payload: { user: any }) {
    try {
      const res = await this.usecases.getWishlist(payload.user.sub);
      return IResponse.success(' wish list fetched successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }
}
