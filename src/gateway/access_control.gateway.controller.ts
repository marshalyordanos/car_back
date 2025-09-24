import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Inject,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
  AssignUserRoleDto,
} from '../operations/acl/access_control.entity';

@Controller('access-control')
export class AccessControlGatewayController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly accessClient: ClientProxy,
  ) {}

  // ----------- ROLES -----------

  @Get('roles/:id')
  async findRoleById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Get('roles')
  async findAllRoles(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    console.log(
      '-----------------------------------------------------------------',
    );
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Post('roles')
  async createRole(@Req() req, @Body() dto: Partial<RoleDto>) {
    const authHeader = req.headers['authorization'] || null;
    console.log(
      '-----------------------------------------------------------------',
      dto,
    );
    return this.accessClient.send(PATTERNS.ROLE_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Patch('roles/:id')
  async updateRole(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Partial<RoleDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Delete('roles/:id')
  async deleteRole(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }

  // ----------- PERMISSIONS -----------

  @Get('permissions/:id')
  async findPermissionById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.PERMISSION_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Get('permissions')
  async findAllPermissions(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.PERMISSION_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Post('permissions')
  async createPermission(@Req() req, @Body() dto: Partial<PermissionDto>) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.PERMISSION_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Patch('permissions/:id')
  async updatePermission(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Partial<PermissionDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.PERMISSION_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Delete('permissions/:id')
  async deletePermission(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.PERMISSION_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }

  // ----------- ROLE ↔ PERMISSION -----------

  @Post('roles/permissions/assign')
  async assignPermissionsToRole(
    @Req() req,
    @Body() dto: ChangeRolePermissionDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_ASSIGN_PERMISSIONS, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Post('roles/:roleId/permissions/remove')
  async removePermissionFromRole(
    @Req() req,
    @Param('roleId') roleId: string,
    @Body('permissionId') permissionId: string,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_REMOVE_PERMISSION, {
      roleId,
      permissionId: permissionId,
      headers: { authorization: authHeader },
    });
  }

  @Post('roles/:roleId/permissions/update')
  async updatePermissionFromRole(
    @Req() req,
    @Param('roleId') roleId: string,
    @Body()
    data: PermissionActionDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_UPDATE_PERMISSION, {
      roleId,
      data: data,
      headers: { authorization: authHeader },
    });
  }

  @Patch('assign-user-role')
  async assignUserRole(@Req() req, @Body() dto: AssignUserRoleDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.accessClient.send(PATTERNS.ROLE_ASSIGN_USER, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }
}
