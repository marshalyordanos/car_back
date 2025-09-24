import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { HostProfileDto, UserDto, UserUpdateDto } from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RpcException } from '@nestjs/microservices';
import { uploadToCloudinary } from '../../config/cloudinary/upload';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
  constructor(private readonly userRepo: UserRepository) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findUserByEmail(email);
  }

  async getUser(id: string) {
    return this.userRepo.findUserById(id);
  }

  async getAllUsers(
    page: number,
    pageSize: number,
    search?: string,
    branchId?: number,
  ): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
    const skip = (page - 1) * pageSize;

    // Dynamic filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (branchId) {
      where.branchId = branchId;
    }

    const [users, total] = await this.userRepo.findAll(skip, pageSize, where);

    const totalPages = Math.ceil(total / pageSize);

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async updateUser(id: string, data: Partial<UserUpdateDto>) {
    const user = await this.userRepo.findUserById(id);
    if (!user) {
      throw new RpcException(`User not found`);
    }
    console.log('===========================: ', data);
    const uploadedFiles: any = {};
    try {
      if (data.profilePhotoFile) {
        console.log('profilePhotoFile: ', data.profilePhotoFile);
        uploadedFiles.profilePhoto = await uploadToCloudinary(
          data.profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
      if (data.driverLicenseFile && user.role?.name == 'GUEST') {
        uploadedFiles.driverLicenseId = await uploadToCloudinary(
          data.driverLicenseFile,
          'users/driverLicenses',
        );
      }
      if (data.nationalIdFile && user.role?.name == 'GUEST') {
        uploadedFiles.nationalId = await uploadToCloudinary(
          data.nationalIdFile,
          'users/nationalIds',
        );
      }
    } catch (err) {
      throw new RpcException('Error uploading files to Cloudinary');
    }
    return this.userRepo.updateUser(id, data, uploadedFiles);
  }

  async updateHostProfile(userId: string, data: HostProfileDto) {
    return this.userRepo.upsertHostProfile(userId, data);
  }
  async verifyHostProfile(userId: string, isVerified: boolean) {
    return this.userRepo.verifyHostProfile(userId, isVerified);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }

  addToWishlist(guestId: string, carId: string) {
    return this.userRepo.addToWishlist(guestId, carId);
  }
  removeFromWishlist(guestId: string, carId: string) {
    return this.userRepo.removeFromWishlist(guestId, carId);
  }

  getWishlist(guestId: string) {
    return this.userRepo.getWishlist(guestId);
  }
}
