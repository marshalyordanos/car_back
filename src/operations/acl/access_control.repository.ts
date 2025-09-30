import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, Permission, RolePermission, User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
} from './access_control.entity';

@Injectable()
export class AccessControlRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- ROLES ----------
  async findRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  async findAllRoles(page: number, pageSize: number, search?: string) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: pageSize,
        where,
        include: { rolePermissions: { include: { permission: true } } },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      roles,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createRole(data: Partial<RoleDto>): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name: data.name!,
        description: data.description,
      },
    });
  }

  async updateRole(id: string, data: Partial<RoleDto>): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteRole(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }

  // ---------- PERMISSIONS ----------
  async findPermissionById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }
  async findRolePermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    return this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });
  }

  async findAllPermissions(page: number, pageSize: number, search?: string) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [{ resource: { contains: search, mode: 'insensitive' } }];
    }

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take: pageSize,
        where,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      permissions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createPermission(data: Partial<PermissionDto>): Promise<Permission> {
    return this.prisma.permission.create({
      data: {
        resource: data.resource!,
        description: data.description,
      },
    });
  }

  async updatePermission(
    id: string,
    data: Partial<PermissionDto>,
  ): Promise<Permission> {
    return this.prisma.permission.update({
      where: { id },
      data: {
        resource: data.resource,
        description: data.description,
      },
    });
  }

  async deletePermission(id: string): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }

  // ---------- ROLE ↔ PERMISSION ----------
  // Usecase method
  async assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role> {
    return this.prisma.role.update({
      where: { id: data.roleId },
      data: {
        rolePermissions: {
          createMany: {
            data: data.permissions!.map((p) => ({
              permissionId: p.permissionId,
              createAction: p.createAction ?? false,
              readAction: p.readAction ?? false,
              updateAction: p.updateAction ?? false,
              deleteAction: p.deleteAction ?? false,
            })),
            skipDuplicates: true, // prevent duplicates
          },
        },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  async updatePermissionFromRole(
    roleId: string,
    data: PermissionActionDto,
  ): Promise<Role> {
    await this.prisma.rolePermission.updateMany({
      where: { roleId, permissionId: data.permissionId },
      data: {
        createAction: data.createAction ?? false,
        readAction: data.readAction ?? false,
        updateAction: data.updateAction ?? false,
        deleteAction: data.deleteAction ?? false,
      },
    });

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }
  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    await this.prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }
  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
