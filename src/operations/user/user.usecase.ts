import { IPagination } from 'src/common/types';
import { UserDto, UserUpdateDto } from './user.entity';
import { User } from '@prisma/client';

export interface UserUsecase {
  getUser(id: string): Promise<User | null>;
  // getAllUsers(
  //   page: number,
  //   pageSize: number,
  //   search?: string,
  //   branchId?: number,
  // ): Promise<{
  //   users: Partial<User>[];
  //   pagination: IPagination;
  // }>;
  updateUser(id: string, data: Partial<UserUpdateDto>): Promise<any>;
  deleteUser(id: string): Promise<User>;
}
