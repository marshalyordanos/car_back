import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import {
  ChangeRoleDto,
  DashboardSummaryDto,
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
import { BankType } from '@prisma/client';

@Controller()
export class UserMessageController {
  constructor(private readonly usecases: UserUseCasesImp) {}

  @MessagePattern(PATTERNS.DASHBOARD_SUMMARY)
  async getSummary(@Payload() dto: { data: DashboardSummaryDto; user: any }) {
    try {
      const summary = await this.usecases.getFullDashboard(
        dto.data,
        dto.user.sub,
      );
      return IResponse.success('Dashboard summary fetched', summary);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DELETE_ACCOUNT)
  async deleteAccount(@Payload() dto: { user: any }) {
    try {
      const summary = await this.usecases.deleteAcount(dto.user.sub);
      return IResponse.success('Your Account is deleted', summary);
    } catch (error) {
      handleCatch(error);
    }
  }
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
  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.READ)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.READ)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.USER_CREATE)
  async create(@Payload() payload: { data: UserCreteDto }) {
    try {
      const model = await this.usecases.createUser(payload.data);
      return IResponse.success('User model created successfully', model);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.READ)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.UPDATE)
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
  @CheckPermission('USER', PermissionActions.UPDATE)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.UPDATE)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.UPDATE)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('USER', PermissionActions.DELETE)
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

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('PAYOUT', PermissionActions.READ)
  @MessagePattern(PATTERNS.PAYOUT_FIND_BY_HOST)
  async findByHost(@Payload() data: { user: any; query: ListQueryDto }) {
    try {
      const res = await this.usecases.getPayoutsByHost(
        data.user?.sub,
        data.query,
      );
      return IResponse.success(
        'Payouts fetched successfully',
        res.models,
        res.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('PAYOUT', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PAYOUT_REQUEST_WITHDRAWAL)
  async requestWithdrawal(
    @Payload()
    data: {
      user: any;
      amount: number;
      accountNumber: string;
      bankType: BankType;
    },
  ) {
    try {
      const payout = await this.usecases.requestWithdrawal(
        data.user.sub,
        data.amount,
        data.accountNumber,
        data.bankType,
      );
      return IResponse.success('Payout request submitted', payout);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.PAYOUT_CHECK_STATUS)
  async checkStatus(@Payload() data: { payoutId: string }) {
    try {
      const payout = await this.usecases.checkStatusForAdmin(data.payoutId);
      return IResponse.success('Payout status fetched', payout);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(permissionGuard.PermissionGuard)
  @CheckPermission('PAYOUT', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PAYOUT_ADMIN_UPDATE_STATUS)
  async updateStatusForAdmin(
    @Payload()
    data: {
      user: any;
      payoutId: string;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
    },
  ) {
    try {
      const result = await this.usecases.updateStatusForAdmin(
        data.payoutId,
        data.user.sub,
        data.status,
        data.reason,
      );

      return IResponse.success('Payout status updated successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }
}
