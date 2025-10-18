import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateHostDto,
  HostProfileDto,
  UserCreteDto,
  UserDto,
  UserUpdateDto,
} from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RpcException } from '@nestjs/microservices';
import { uploadToCloudinary } from '../../config/cloudinary/upload';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
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

  async activeOrDiactiveUser(userId: string, isActive: boolean) {
    return this.userRepo.activeOrDiactiveUser(userId, isActive);
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
  async createUser(data: UserCreteDto) {
    return this.userRepo.createUser(data);
  }

  async createHost(data: CreateHostDto): Promise<any> {
    const role = await this.userRepo.findRoleByName('HOST');
    if (!role) {
      throw new RpcException('RENTAL role is not found!');
    }

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
    } catch (err) {
      throw new RpcException('Error uploading files to Cloudinary');
    }
    if (role.name == 'HOST') {
      return this.userRepo.createHostUser(data, role.id, uploadedFiles);
    }
  }
}
