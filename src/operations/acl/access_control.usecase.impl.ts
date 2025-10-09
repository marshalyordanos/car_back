import { Injectable } from '@nestjs/common';
import { AccessControlUsecase } from './access_control.usecase';
import { AccessControlRepository } from './access_control.repository';
import { IPagination } from 'src/common/types';
import { Role, Permission, User } from '@prisma/client';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
} from './access_control.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AccessControlUsecaseImpl {
  constructor(private readonly repo: AccessControlRepository) {}

  // ---------- ROLES ----------
  async getRole(id: string): Promise<Role | null> {
    return this.repo.findRoleById(id);
  }

  async getAllRoles(page: number, pageSize: number, search?: string) {
    return this.repo.findAllRoles(page, pageSize, search);
  }

  async createRole(data: Partial<RoleDto>): Promise<Role> {
    return this.repo.createRole(data);
  }

  async updateRole(id: string, data: Partial<RoleDto>): Promise<Role> {
    const role = await this.repo.findRoleById(id);
    if (!role) {
      throw new RpcException(`role with ${id} id  is not found!`);
    }
    if (
      role.name == 'GUEST' ||
      role.name == 'SUPER_ADMIN' ||
      role.name == 'HOST'
    ) {
      throw new RpcException(`This role can not be update!`);
    }

    return this.repo.updateRole(id, data);
  }

  async deleteRole(id: string): Promise<Role> {
    const role = await this.repo.findRoleById(id);
    if (!role) {
      throw new RpcException(`role with ${id} id  is not found!`);
    }
    if (
      role.name == 'GUEST' ||
      role.name == 'SUPER_ADMIN' ||
      role.name == 'HOST'
    ) {
      throw new RpcException(`This role can not be Deleted!`);
    }
    return this.repo.deleteRole(id);
  }

  // ---------- PERMISSIONS ----------
  async getPermission(id: string): Promise<Permission | null> {
    return this.repo.findPermissionById(id);
  }

  async getAllPermissions(page: number, pageSize: number, search?: string) {
    return this.repo.findAllPermissions(page, pageSize, search);
  }

  async createPermission(data: Partial<PermissionDto>): Promise<Permission> {
    return this.repo.createPermission(data);
  }

  async updatePermission(
    id: string,
    data: Partial<PermissionDto>,
  ): Promise<Permission> {
    return this.repo.updatePermission(id, data);
  }

  async deletePermission(id: string): Promise<Permission> {
    return this.repo.deletePermission(id);
  }

  // ---------- ROLE ↔ PERMISSION ----------
  async assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role> {
    if (!data.permissions || data.permissions.length == 0) {
      throw new RpcException({
        message: "persmissions doen't exisit!",
        statusCode: 400,
      });
    }
    return this.repo.assignPermissionsToRole(data);
  }

  async updatedPermissionFromRole(
    roleId: string,
    data: PermissionActionDto,
  ): Promise<Role> {
    const perm = await this.repo.findRolePermission(roleId, data.permissionId);
    if (!perm) {
      throw new RpcException({
        message: "RolePermission doen't exisit",
        statusCode: 400,
      });
    }
    return this.repo.updatePermissionFromRole(roleId, data);
  }
  async removePermissionFromRole(roleId: string, data: string): Promise<Role> {
    const perm = await this.repo.findRolePermission(roleId, data);
    if (!perm) {
      throw new RpcException({
        message: "RolePermission doen't exisit",
        statusCode: 400,
      });
    }
    return this.repo.removePermissionFromRole(roleId, data);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const role = await this.repo.findRoleById(roleId);
    if (!role) {
      throw new RpcException({
        message: "Role doen't exisit",
        statusCode: 400,
      });
    }
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new RpcException({
        message: "User doen't exisit",
        statusCode: 400,
      });
    }
    return this.repo.assignRoleToUser(userId, roleId);
  }
}
