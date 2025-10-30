import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './decorator/check-permission.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionActions } from '../contracts/permission-actions.enum';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log(
      '888888888888888888888888888888888888888888888888888888888888888888888888888888',
    );
    const required = this.reflector.get<{
      resource: string;
      action: PermissionActions;
    }>(PERMISSION_KEY, context.getHandler());

    if (!required) return true; // no permission required

    const { resource, action } = required;

    console.log(
      '888888888888888888888888888888888888888888888888888888888888888888888888888888',
      resource,
      action,
    );
    // Get user from request
    const req = context.switchToHttp().getRequest();
    const userData = req.user;
    const user = await this.prisma.user.findUnique({
      where: { id: userData.sub },
    });

    if (!user) throw new RpcException('User not authenticated');

    // Super admin bypass
    if (user.isSuperAdmin) return true;

    if (!user.roleId) throw new RpcException('User has no role assigned');

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    // Dynamically check the action
    const hasPermission = rolePermissions.some(
      (rp) => rp.permission.resource === resource && rp[action],
    );

    if (!hasPermission) {
      throw new RpcException(
        `You do not have permission to perform action [${action}] on ${resource}`,
      );
    }

    return true;
  }
}
