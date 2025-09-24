import { Prisma, User } from '@prisma/client';
import { ChangeRoleDto } from '../user/user.entity';
import { RegisterStaffDto,UpdateStaffDto } from './staff.entity';
import { IPagination } from 'src/common/types';

export interface StaffUsecase {
  changeUserRole(data: ChangeRoleDto): Promise<User>;
  createStaff(data: RegisterStaffDto, email: string): Promise<User>;
  findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }>;
  findAllStaff(
    data: any,
  ): Promise<{ users: Partial<User>[]; pagination: IPagination }>;
//   findUserByEmail(email: string): Promise<User | null>;

deleteStaff(id: string): Promise<string>;
findStaffById(id: string): Promise<User>;
updateStaff(id: string, data: UpdateStaffDto): Promise<User>;
findStaffByBranch(data: any): Promise<{ staffs: Partial<User>[]; pagination: IPagination }>;
assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
}
