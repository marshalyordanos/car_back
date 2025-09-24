import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { StaffUsecase } from './staff.useCase';
import {
  ChangeRoleDto,
  RegisterStaffDto,
  UpdateStaffDto,
} from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import { IPagination } from 'src/common/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffUseCasesImpl implements StaffUsecase {
  constructor(private readonly staffRepo: StaffRepository) {}

  async createStaff(data: RegisterStaffDto): Promise<User> {
    if (data.role) {
      const roleName = data.role;
      const role = await this.staffRepo.findRoleByName(roleName);

      if (!role) {
        throw new RpcException(`Invalid role: ${roleName}`);
      }
      data.role = role.id;
    }
     if (data.branchId) {
      const branch = await this.staffRepo.findBranchById(data.branchId);

      if (!branch) {
        throw new RpcException(`Branch not found with id : ${data.branchId}`);
      }
      data.branchId = branch.id;
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    // Pass DTO and roleId to repository
    return this.staffRepo.createStaff(data);
  }

  async findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
    const { page = 1, pageSize = 10, role } = data;

    const skip = (page - 1) * pageSize;

    // Check role existence
    const roles = await this.staffRepo.findRoleByName(role);

    if (!role) {
      throw new RpcException(`Invalid role: ${role}`);
    }
    const roleId = roles.id;

    const [users, total] = await this.staffRepo.findStaffByRole(
      skip,
      roleId,
      pageSize,
    );

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
  async findAllStaff(
    data: any,
  ): Promise<{ users: Partial<User>[]; pagination: IPagination }> {
    const { page = 1, pageSize = 10, search } = data;

    const skip = (page - 1) * pageSize;

    // Dynamic filters
    const where: any = {
      isStaff: true, //  filter only staff
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await this.staffRepo.findAllStaff(
      skip,
      where,
      pageSize,
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async changeUserRole(data: ChangeRoleDto): Promise<User> {
     const user = await this.staffRepo.findStaffById(data.userId);

    if (!user) {
      throw new RpcException(`User with id ${data.userId} not found`);
    }

    const role = await this.staffRepo.findRoleByName(data.role);

    if (!role) {
      throw new RpcException(`Role ${data.role} not found`);
    }

    return this.staffRepo.changeUserRole(user,role);
  }

  async deleteStaff(id: string): Promise<string> {
    // Check if staff exists
    const staff = await this.staffRepo.findStaffById(id);

    if (!staff) {
      throw new RpcException(`User with id ${id} not found`);
    }
     await this.staffRepo.deleteStaff(id);
    return 'User deleted successfully with id: ' + id;
  }
  async findStaffById(id: string): Promise<User> {
    const result = await this.staffRepo.findStaffById(id);

    if (!result) {
      throw new Error('User not found');
    }
    return result;
  }
  async updateStaff(id: string, data: UpdateStaffDto): Promise<User> {
    return this.staffRepo.updateStaff(id, data);
  }

  async findStaffByBranch(
    data: any,
  ): Promise<{ staffs: Partial<User>[]; pagination: IPagination }> {
    const { page = 1, pageSize = 10, branchId, search } = data;

    const skip = (page - 1) * pageSize;

    const where: any = {
      isStaff: true,
      branchId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [staffs, total] = await this.staffRepo.findStaffByBranch(
      skip,
      where,
      pageSize,
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      staffs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async assignStaffToBranch(
    staffIds: string[],
    branchId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.staffRepo.assignStaffToBranch(staffIds, branchId);
  }
}
