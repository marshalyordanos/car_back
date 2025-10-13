import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HostProfileDto, UserCreteDto, UserUpdateDto } from './user.entity';
import { HostProfile, Prisma, Role, User } from '@prisma/client';
import * as queryDto from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(
    id: string,
  ): Promise<(User & { role: Role | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, hostProfile: true, guestProfile: true },
    });
  }

  async findAll(filter: queryDto.ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: [
        'firstName',
        'lastName',
        'role.name',
        'phone',
        'email',
      ],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        include: { role: true, hostProfile: true, guestProfile: true },
        where: query.where || {},
      }),
      this.prisma.user.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async createUser(data: UserCreteDto, roleId?: string) {
    const { firstName, lastName, email, phone } = data;

    const hashedPassword = await bcrypt.hash('12345678', 10);

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        roleId: roleId ?? undefined,
        isStaff: true,
      },
      include: { role: true, guestProfile: true, hostProfile: true },
    });
  }

  async createHostUser(
    data: UserCreteDto,
    roleId?: string,
    files?: {
      profilePhoto?: string;
    },
  ) {
    const { firstName, lastName, email, phone } = data;

    const hashedPassword = await bcrypt.hash('12345678', 10);

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        profilePhoto: files?.profilePhoto,
        phone,
        password: hashedPassword,
        roleId: roleId ?? undefined,
      },
      include: { role: true, guestProfile: true, hostProfile: true },
    });
  }

  async updateUser(
    id: string,
    data: Partial<UserUpdateDto>,
    files?: {
      profilePhoto?: string;
      driverLicenseId?: string;
      nationalId?: string;
    },
  ): Promise<UserWithRelations | null> {
    const { firstName, lastName, email } = data;
    console.log('files?.profilePhoto ??', files);
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        email: email ?? undefined,
        profilePhoto: files?.profilePhoto ?? undefined,
        guestProfile:
          files?.driverLicenseId || files?.nationalId
            ? {
                update: {
                  driverLicenseId: files?.driverLicenseId ?? undefined,
                  nationalId: files?.nationalId ?? undefined,
                },
              }
            : undefined,
      },
      include: { role: true, guestProfile: true, hostProfile: true },
    });
  }

  async upsertHostProfile(
    userId: string,
    data: HostProfileDto,
  ): Promise<HostProfile> {
    return this.prisma.hostProfile.upsert({
      where: { userId }, // because userId is @unique
      create: {
        userId,
        payoutMethod: data.payoutMethod,
        earnings: data.earnings ?? 0,
      },
      update: {
        payoutMethod: data.payoutMethod ?? undefined,
        earnings: data.earnings ?? undefined,
      },
    });
  }

  async verifyHostProfile(
    userId: string,
    isVerified: boolean,
  ): Promise<HostProfile> {
    return this.prisma.hostProfile.upsert({
      where: { userId }, // because userId is @unique
      create: {
        userId,
        isVerified: isVerified ?? false,
      },
      update: {
        isVerified: isVerified ?? undefined,
      },
    });
  }

  async activeOrDiactiveUser(userId: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: isActive ?? undefined,
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async addToWishlist(guestId: string, carId: string) {
    return this.prisma.guestProfile.update({
      where: { id: guestId },
      data: {
        wishlist: {
          connect: { id: carId },
        },
      },
      include: { wishlist: true },
    });
  }

  async removeFromWishlist(guestId: string, carId: string) {
    return this.prisma.guestProfile.update({
      where: { id: guestId },
      data: {
        wishlist: {
          disconnect: { id: carId },
        },
      },
      include: { wishlist: true },
    });
  }

  async getWishlist(guestId: string) {
    return this.prisma.guestProfile.findUnique({
      where: { id: guestId },
      include: { wishlist: true },
    });
  }
  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({ where: { name: name } });
  }
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { role: true; guestProfile: true; hostProfile: true };
}>;

type UserWithHostProfile = Prisma.UserGetPayload<{
  include: { role: true; hostProfile: true };
}>;
