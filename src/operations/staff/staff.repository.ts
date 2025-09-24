import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User, Prisma, Role } from '@prisma/client';
import { IPagination } from '../../common/types';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeRoleDto, UserDto } from '../user/user.entity';
import { UpdateStaffDto } from './staff.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class StaffRepository {

  constructor(private prisma: PrismaService) {}

  async changeUserRole(user: User, role: Role): Promise<User> {
    // Update user with new role
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: { connect: { id: role.id } },
      },
      include: {
        role: true, // optional: return updated role info
        branch: true, // optional: return branch info if relevant
      },
    });
  }

  async createStaff(data: UserDto): Promise<User> {
    // Transform DTO into Prisma create input
    const prismaData: Prisma.UserCreateInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      isStaff: true,
      role: data.role ? { connect: { id: data.role } } : undefined, // relation
      branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
    };

    return this.prisma.user.create({
      data: prismaData,
    });
  }

  async findRoleByName(roleName: string) {
    return this.prisma.role.findUnique({ where: { name: roleName } });
  }
  async findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({ where: { id: branchId } });
  }

  async findStaffByRole(skip: any, roleId: any, pageSize: number) {
    return await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where: {
          roleId,
        },
        include: {
          role: true,
          branch: true,
        },
      }),
      this.prisma.user.count({ where: { roleId } }),
    ]);
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, branch: true },
    });
  }
  async deleteStaff(id: string) {
   return await this.prisma.user.delete({ where: { id } });

  }
  async findStaffById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        branch: true,
      },
    });
  }
  async findAllStaff(skip: number, where: any, pageSize: number) {
    return await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          role: true,
          branch: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  async updateStaff(id: string, data: UpdateStaffDto) {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async findStaffByBranch(skip: number, where: any, pageSize: number) {
    return await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          role: true,
          branch: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

async assignStaffToBranch(staffIds: string[], branchId: string) {
  return await this.prisma.user.updateMany({
    where: { id: { in: staffIds } },
    data: { branchId },
  });
}

}
