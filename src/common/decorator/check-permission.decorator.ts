import { SetMetadata } from '@nestjs/common';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

export const PERMISSION_KEY = 'permissions';
export const CheckPermission = (resource: string, action: PermissionActions) =>
  SetMetadata(PERMISSION_KEY, { resource, action });
