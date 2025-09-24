import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HostProfileDto, UserUpdateDto } from './user.entity';
import { HostProfile, Prisma, Role, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(
    id: string,
  ): Promise<(User & { role: Role | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findAll(skip: number, pageSize: number, where: any) {
    return await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          email: true,
          id: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          hostProfile: true,
          guestProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
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
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { role: true; guestProfile: true; hostProfile: true };
}>;

type UserWithHostProfile = Prisma.UserGetPayload<{
  include: { role: true; hostProfile: true };
}>;
