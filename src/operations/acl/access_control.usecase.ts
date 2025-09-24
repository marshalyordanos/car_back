import { IPagination } from 'src/common/types';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
} from './access_control.entity';
import { Role, Permission } from '@prisma/client';

export interface AccessControlUsecase {
  // Roles
  getRole(id: string): Promise<Role | null>;
  getAllRoles(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ roles: Partial<RoleDto>[]; pagination: IPagination }>;
  createRole(data: Partial<RoleDto>): Promise<Role>;
  updateRole(id: string, data: Partial<RoleDto>): Promise<Role>;
  deleteRole(id: string): Promise<Role>;

  // Permissions
  getPermission(id: string): Promise<Permission | null>;
  getAllPermissions(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    permissions: Partial<PermissionDto>[];
    pagination: IPagination;
  }>;
  createPermission(data: Partial<PermissionDto>): Promise<Permission>;
  updatePermission(
    id: string,
    data: Partial<PermissionDto>,
  ): Promise<Permission>;
  deletePermission(id: string): Promise<Permission>;

  // Assign permissions to roles
  assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role>;
  updatedPermissionFromRole(
    roleId: string,
    data: PermissionActionDto,
  ): Promise<Role>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>;
}
