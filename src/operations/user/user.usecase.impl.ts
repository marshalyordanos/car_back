import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateHostDto,
  DashboardSummaryDto,
  HostProfileDto,
  PlatformFeeDto,
  UserCreteDto,
  UserDto,
  UserUpdateDto,
} from './user.entity';
import { BankType, User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RpcException } from '@nestjs/microservices';
import { uploadToSpaces } from '../../config/cloudinary/upload';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class UserUseCasesImp {
  constructor(private readonly userRepo: UserRepository) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findUserByEmail(email);
  }

  async getUser(id: string, isMe = false, userId = '') {
    if (isMe) {
      if (userId != id) {
        throw new RpcException('You have not allowed to access!');
      }
    }
    return this.userRepo.findUserById(id);
  }

  async getAllUsers(query: ListQueryDto) {
    if (/isStaff:[^,]*/.test(query.filter || '')) {
      query.filter = (query.filter || '').replace(
        /isStaff:[^,]*/,
        `isStaff:${true}`,
      );
    } else {
      query.filter = query.filter
        ? query.filter + `,isStaff:${true}`
        : `isStaff:${true}`;
    }
    const res = await this.userRepo.findAll(query);

    return {
      models: res.models,
      pagination: res.pagination,
    };
  }
  async getAllCustomers(query: ListQueryDto) {
    const role = await this.userRepo.findRoleByName('GUEST');
    if (!role) {
      throw new RpcException('GUEST role is not found!');
    }

    if (/roleId:[^,]*/.test(query.filter || '')) {
      query.filter = (query.filter || '').replace(
        /roleId:[^,]*/,
        `roleId:${role.id}`,
      );
    } else {
      query.filter = query.filter
        ? query.filter + `,roleId:${role.id}`
        : `roleId:${role.id}`;
    }
    const res = await this.userRepo.findAll(query);

    return {
      models: res.models,
      pagination: res.pagination,
    };
  }

  async getAllHosts(query: ListQueryDto) {
    const role = await this.userRepo.findRoleByName('HOST');
    if (!role) {
      throw new RpcException('RENTAL role is not found!');
    }

    if (/roleId:[^,]*/.test(query.filter || '')) {
      query.filter = (query.filter || '').replace(
        /roleId:[^,]*/,
        `roleId:${role.id}`,
      );
    } else {
      query.filter = query.filter
        ? query.filter + `,roleId:${role.id}`
        : `roleId:${role.id}`;
    }
    const res = await this.userRepo.findAll(query);

    return {
      models: res.models,
      pagination: res.pagination,
    };
  }

  async updateUser(
    id: string,
    data: Partial<UserUpdateDto>,
    isMe = false,
    userId = '',
    uploadedFiles: any,
  ) {
    if (isMe) {
      if (userId != id) {
        throw new RpcException('You have not allowed to access!');
      }
    }
    const user = await this.userRepo.findUserById(id);
    if (!user) {
      throw new RpcException(`User not found`);
    }
    // console.log('===========================: ', data);
    // const uploadedFiles: any = {};
    // try {
    //   if (data.profilePhotoFile) {
    //     console.log('profilePhotoFile: ', data.profilePhotoFile);
    //     uploadedFiles.profilePhoto = await uploadToSpaces(
    //       data.profilePhotoFile,
    //       'users/profilePhotos',
    //     );
    //     console.log('uploadedFiles: ', uploadedFiles);
    //   }
    //   if (data.driverLicenseFile && user.role?.name == 'GUEST') {
    //     uploadedFiles.driverLicenseId = await uploadToSpaces(
    //       data.driverLicenseFile,
    //       'users/driverLicenses',
    //     );
    //   }
    //   if (data.nationalIdFile && user.role?.name == 'GUEST') {
    //     uploadedFiles.nationalId = await uploadToSpaces(
    //       data.nationalIdFile,
    //       'users/nationalIds',
    //     );
    //   }
    // } catch (err) {
    //   throw new RpcException('Error uploading files to Cloudinary');
    // }
    return this.userRepo.updateUser(id, data, uploadedFiles);
  }

  async updateHostProfile(userId: string, data: HostProfileDto) {
    return this.userRepo.upsertHostProfile(userId, data);
  }
  async verifyHostProfile(userId: string, isVerified: boolean) {
    return this.userRepo.verifyHostProfile(userId, isVerified);
  }

  async activeOrDiactiveUser(userId: string, isActive: boolean) {
    return this.userRepo.activeOrDiactiveUser(userId, isActive);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }
  async deleteAcount(id: string) {
    return this.userRepo.softDeleteAccount(id);
  }

  async addToWishlist(guestId: string, carId: string) {
    const user = await this.userRepo.findUserById(guestId);
    if (!user || !user?.guestProfile?.id) {
      throw new RpcException(
        'No "GuestProfile" record was found for a connect on many-to-many relation "Wishlis"',
      );
    }
    return this.userRepo.addToWishlist(user?.guestProfile?.id, carId);
  }
  async removeFromWishlist(guestId: string, carId: string) {
    const user = await this.userRepo.findUserById(guestId);
    console.log('useruseruseruser:', user);

    if (!user || !user?.guestProfile?.id) {
      throw new RpcException(
        'No "GuestProfile" record was found for a connect on many-to-many relation "Wishlis"',
      );
    }
    return this.userRepo.removeFromWishlist(user?.guestProfile?.id, carId);
  }

  async getWishlist(guestId: string) {
    const user = await this.userRepo.findUserById(guestId);
    if (!user || !user?.guestProfile?.id) {
      throw new RpcException(
        'No "GuestProfile" record was found for a connect on many-to-many relation "Wishlis"',
      );
    }
    return this.userRepo.getWishlist(user.guestProfile.id);
  }
  async createUser(data: UserCreteDto) {
    return this.userRepo.createUser(data);
  }

  async createHost(data: CreateHostDto, uploadedFiles: any): Promise<any> {
    const role = await this.userRepo.findRoleByName('HOST');
    if (!role) {
      throw new RpcException('RENTAL role is not found!');
    }

    // const uploadedFiles: any = {};
    // try {
    //   if (data.profilePhotoFile) {
    //     console.log('profilePhotoFile: ', data.profilePhotoFile);
    //     uploadedFiles.profilePhoto = await uploadToSpaces(
    //       data.profilePhotoFile,
    //       'users/profilePhotos',
    //     );
    //     console.log('uploadedFiles: ', uploadedFiles);
    //   }
    // } catch (err) {
    //   throw new RpcException('Error uploading files to Cloudinary');
    // }
    if (role.name == 'HOST') {
      return this.userRepo.createHostUser(data, role.id, uploadedFiles);
    }
  }

  async getFullDashboard(data: DashboardSummaryDto, userId: string) {
    const role = await this.userRepo.findRoleByUserId(userId);

    let id: any;
    if (!role) {
      throw new RpcException('RENTAL role is not found!');
    }
    if (role.name == 'HOST') {
      id = userId;
    } else {
      id = null;
    }
    return this.userRepo.getDashboardSummary(
      data.entity,
      data.startDate,
      data.endDate,
      id,
    );
  }

  async getPayoutsByHost(hostId: string, query: ListQueryDto) {
    const user = await this.userRepo.findUserById(hostId);
    if (!user) {
      throw new RpcException('Invalid host ID or user is not a host');
    }
    if (user.role?.name === 'HOST') {
      return this.userRepo.findByHost(hostId, query);
    }

    return this.userRepo.findPayouts(query);
  }

  async requestWithdrawal(
    hostId: string,
    amount: number,
    accountNumber: string,
    bankType: BankType,
  ) {
    // ✅ Verify host exists and has sufficient balance
    const host = await this.userRepo.findUserById(hostId);
    if (!host || !host.hostProfile?.isVerified) {
      throw new RpcException('Host not found or not verified');
    }

    if (host.hostProfile.earnings < amount) {
      throw new RpcException('Insufficient balance');
    }

    // ✅ Deduct temporarily (hold funds)
    await this.userRepo.updateHostEarnings(
      hostId,
      host.hostProfile.earnings - amount,
    );

    // ✅ Create payout request
    const payout = await this.userRepo.create(
      hostId,
      amount,
      accountNumber,
      bankType,
    );

    return payout;
  }

  async checkStatusForAdmin(payoutId: string) {
    const payout = await this.userRepo.findPayOutById(payoutId);
    if (!payout) throw new RpcException('Payout not found');
    return payout;
  }

  // async updateStatusForAdmin(
  //   payoutId: string,
  //   status: string,
  //   transactionId?: string,
  // ) {
  //   const payout = await this.userRepo.updateStatus(
  //     payoutId,
  //     status,
  //     transactionId,
  //   );
  //   return payout;
  // }
  async updateStatusForAdmin(
    payoutId: string,
    adminId: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string,
  ) {
    const payout = await this.userRepo.findPayOutById(payoutId);
    if (!payout) throw new RpcException('Payout not found');

    if (payout.status !== 'PENDING') {
      throw new RpcException(
        `Payout is already ${payout.status}, cannot update.`,
      );
    }

    let updated: any;

    if (status === 'APPROVED') {
      updated = await this.userRepo.updateStatus(payoutId, 'APPROVED', reason);
    } else if (status === 'REJECTED') {
      const host = await this.userRepo.findUserById(payout.hostId);

      await this.userRepo.updateHostEarnings(
        payout.hostId,
        (host?.hostProfile?.earnings! || 0) + payout.amount,
      );
      updated = await this.userRepo.updateStatus(payoutId, 'REJECTED');
    }

    // Log admin action
    // await this.adminRepo.create(
    //   adminId,
    //   'UPDATE_PAYOUT_STATUS',
    //   'Payout',
    //   payoutId,
    //   `Status changed to ${status}`,
    // );

    // Notify host
    const message =
      status === 'APPROVED'
        ? `Your payout request of ${payout.amount} ETB has been approved.`
        : `Your payout request of ${payout.amount} ETB has been rejected. Funds were returned to your balance.`;

    // await this.notificationRepo.createPayoutNotification(payout.hostId, 'PAYMENT', 'Payout Update', message);

    return updated;
  }

  async createOrUpdateFee(data: PlatformFeeDto) {
    return this.userRepo.createOrUpdate(data);
  }

  async getFee() {
    return this.userRepo.getFee();
  }
}
