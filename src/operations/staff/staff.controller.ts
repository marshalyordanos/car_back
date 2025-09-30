import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Public } from '../../common/decorator/public.decorator';
import * as handleCatch from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { ChangeRoleDto, UpdateStaffDto } from './staff.entity';
import { StaffUseCasesImpl } from './staff.useCase.impl';
import { RegisterStaffDto } from './staff.entity';

@Controller()
export class StaffMessageController {
  constructor(private readonly usecases: StaffUseCasesImpl) {}

  //COmpleted as Marshal wants
  //Create staff
  @MessagePattern(PATTERNS.STAFF_CREATE)
  async createStaff(@Payload() payload: { user: any; data: RegisterStaffDto }) {
    try {
      const result = await this.usecases.createStaff(payload.data);

      return IResponse.success('Staff created successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Completed but additional
  //Get all staffs by role
  @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ROLE)
  async findStaffByRole(@Payload() payload: any) {
    console.log('INSIDE CONTROLLER FOR ROLE : ', payload.role);

    try {
      const user = payload.user;
      const { role } = payload;

      const result = await this.usecases.findStaffByRole(payload);

      return IResponse.success(
        'Staff fetched successfully for role: ' + role,
        result.users,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //COmpleted as marshal wanted
  //Get all staffs
  @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_ALL)
  async findStaff(@Payload() data: any) {
    try {
      // const { page = 1, pageSize = 10, search, branchId } = data;

      const result = await this.usecases.findAllStaff(data);

      return IResponse.success(
        'Users fetched successfully',
        result.users,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Completed as marshal wanted
  @Public()
  @MessagePattern(PATTERNS.USER_CHANGE_ROLE)
  async changeUserRole(@Payload() payload: ChangeRoleDto) {
    try {
      console.log('payload: ', payload);

      const result = await this.usecases.changeUserRole(payload);

      return IResponse.success('Role changed successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Delete staff members
  @Public()
  @MessagePattern(PATTERNS.STAFF_DELETE)
  async deleteStaff(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.deleteStaff(payload.id);

      return IResponse.success('Staff deleted successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ID)
  async findStaffById(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.findStaffById(payload.id);

      return IResponse.success('User fetched successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.STAFF_UPDATE)
  async updateStaff(@Payload() payload: { id: string; data: UpdateStaffDto }) {
    try {
      const result = await this.usecases.updateStaff(payload.id, payload.data);
      return IResponse.success('User updated successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_BRANCH)
  async findStaffByBranch(@Payload() payload: any) {
    try {
      const result = await this.usecases.findStaffByBranch(payload);

      return IResponse.success(
        'Users fetched successfully',
        result.staffs,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }
}
