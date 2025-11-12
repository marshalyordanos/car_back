import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { AccessControlUsecaseImpl } from './access_control.usecase.impl';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
  AssignUserRoleDto,
} from './access_control.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class AccessControlMessageController {
  constructor(private readonly usecases: AccessControlUsecaseImpl) {}

  // ----------- ROLES -----------

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.READ)
  @MessagePattern(PATTERNS.ROLE_FIND_BY_ID)
  async findRoleById(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.getRole(payload.id);
      return IResponse.success('Role fetched successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.READ)
  @MessagePattern(PATTERNS.ROLE_FIND_ALL)
  async findAllRoles(@Payload() payload: any) {
    console.log(
      '===============================================================',
    );
    try {
      const { page = 1, pageSize = 10, search } = payload;
      const result = await this.usecases.getAllRoles(page, pageSize, search);
      return IResponse.success(
        'Roles fetched successfully',
        result.roles,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_CREATE)
  async createRole(@Payload() payload: { data: Partial<RoleDto> }) {
    try {
      console.log(
        '===============================================================',
        payload.data,
      );
      const result = await this.usecases.createRole(payload.data);
      return IResponse.success('Role created successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_UPDATE)
  async updateRole(@Payload() payload: { id: string; data: Partial<RoleDto> }) {
    try {
      const result = await this.usecases.updateRole(payload.id, payload.data);
      return IResponse.success('Role updated successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.ROLE_DELETE)
  async deleteRole(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.deleteRole(payload.id);
      return IResponse.success('Role deleted successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  // ----------- PERMISSIONS -----------

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.READ)
  @MessagePattern(PATTERNS.PERMISSION_FIND_BY_ID)
  async findPermissionById(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.getPermission(payload.id);
      return IResponse.success('Permission fetched successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.READ)
  @MessagePattern(PATTERNS.PERMISSION_FIND_ALL)
  async findAllPermissions(@Payload() payload: any) {
    try {
      const { page = 1, pageSize = 10, search } = payload;
      const result = await this.usecases.getAllPermissions(
        page,
        pageSize,
        search,
      );
      return IResponse.success(
        'Permissions fetched successfully',
        result.permissions,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PERMISSION_CREATE)
  async createPermission(@Payload() payload: { data: PermissionDto }) {
    try {
      const result = await this.usecases.createPermission(payload.data);
      return IResponse.success('Permission created successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PERMISSION_UPDATE)
  async updatePermission(
    @Payload() payload: { id: string; data: Partial<PermissionDto> },
  ) {
    try {
      const result = await this.usecases.updatePermission(
        payload.id,
        payload.data,
      );
      return IResponse.success('Permission updated successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PERMISSION_DELETE)
  async deletePermission(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.deletePermission(payload.id);
      return IResponse.success('Permission deleted successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  // ----------- ROLE ↔ PERMISSION -----------

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_ASSIGN_PERMISSIONS)
  async assignPermissionsToRole(
    @Payload() payload: { data: ChangeRolePermissionDto },
  ) {
    try {
      const result = await this.usecases.assignPermissionsToRole(payload.data);
      return IResponse.success(
        'Permissions assigned to role successfully',
        result,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_UPDATE_PERMISSION)
  async updatePermissionFromRole(
    @Payload()
    payload: {
      roleId: string;
      data: PermissionActionDto;
    },
  ) {
    try {
      const result = await this.usecases.updatedPermissionFromRole(
        payload.roleId,
        payload.data,
      );
      return IResponse.success(
        'Permission updated from role successfully',
        result,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_REMOVE_PERMISSION)
  async removePermissionFromRole(
    @Payload()
    payload: {
      roleId: string;
      permissionId: string;
    },
  ) {
    try {
      const result = await this.usecases.removePermissionFromRole(
        payload.roleId,
        payload.permissionId,
      );
      return IResponse.success(
        'Permission removed from role successfully',
        result,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('RBAC', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_ASSIGN_USER)
  async assignUserRole(@Payload() payload: { data: AssignUserRoleDto }) {
    try {
      const result = await this.usecases.assignRoleToUser(
        payload.data.userId,
        payload.data.roleId,
      );
      return IResponse.success('Role assigned to user successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }
}
