import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HostProfileDto, UserCreteDto, UserUpdateDto } from './user.entity';
import {
  BookingStatus,
  HostProfile,
  PaymentStatus,
  Prisma,
  Role,
  User,
  UserRole,
} from '@prisma/client';
import * as queryDto from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: string) {
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
        hostProfile: {
          create: {
            payoutMethod: null,
            earnings: 0,
            isVerified: false,
          },
        },
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
      include: {
        wishlist: { include: { make: true, model: true, host: true } },
      },
    });
  }
  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({ where: { name: name } });
  }

  async getDashboardSummary() {
    // Run parallel queries for performance
    const [
      bookingGroups,
      paymentGroups,
      paymentTotals,
      // carGroups,
      ecoGroups,
      totalCars,
      totalUsers,
      guestCount,
      hostCount,
      adminCount,
      disputeGroups,
    ] = await Promise.all([
      // Booking grouped by status
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Payment grouped by status
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Payment totals
      this.prisma.payment.aggregate({
        _sum: {
          amount: true,
          insuranceFee: true,
          platformFee: true,
          hostEarnings: true,
        },
      }),
      // Cars grouped by type
      // this.prisma.car.groupBy({
      //   by: ['carType'],
      //   _count: { carType: true },
      // }),
      // Cars grouped by eco-friendly type
      this.prisma.car.groupBy({
        by: ['ecoFriendly'],
        _count: { ecoFriendly: true },
      }),
      // Total cars
      this.prisma.car.count(),
      // Total users
      this.prisma.user.count(),
      // Guests count
      this.prisma.user.count({ where: { role: { name: UserRole.GUEST } } }),
      // Hosts count
      this.prisma.user.count({ where: { role: { name: UserRole.HOST } } }),
      // Admins count
      this.prisma.user.count({ where: { role: { name: UserRole.ADMIN } } }),
      // Dispute grouped by status
      this.prisma.dispute.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // --- Booking summary ---
    const bookingSummary = {
      totalBookings: bookingGroups.reduce((acc, b) => acc + b._count.status, 0),
      pending:
        bookingGroups.find((b) => b.status === BookingStatus.PENDING)?._count
          .status || 0,
      cancelledByGuest:
        bookingGroups.find((b) => b.status === BookingStatus.CANCELLED_BY_GUEST)
          ?._count.status || 0,
      cancelledByHost:
        bookingGroups.find((b) => b.status === BookingStatus.CANCELLED_BY_HOST)
          ?._count.status || 0,
      cancelledByAdmin:
        bookingGroups.find((b) => b.status === BookingStatus.CANCELLED_BY_ADMIN)
          ?._count.status || 0,
      completed:
        bookingGroups.find((b) => b.status === BookingStatus.COMPLETED)?._count
          .status || 0,
    };

    // --- Payment summary ---
    const paymentSummary = {
      totalPayments: paymentGroups.reduce((acc, p) => acc + p._count.status, 0),
      pending:
        paymentGroups.find((p) => p.status === PaymentStatus.PENDING)?._count
          .status || 0,
      completed:
        paymentGroups.find((p) => p.status === PaymentStatus.COMPLETED)?._count
          .status || 0,
      failed:
        paymentGroups.find((p) => p.status === PaymentStatus.FAILED)?._count
          .status || 0,
      refunded:
        paymentGroups.find((p) => p.status === PaymentStatus.REFUNDED)?._count
          .status || 0,
      totals: {
        amount: paymentTotals._sum.amount || 0,
        insuranceFee: paymentTotals._sum.insuranceFee || 0,
        platformFee: paymentTotals._sum.platformFee || 0,
        hostEarnings: paymentTotals._sum.hostEarnings || 0,
      },
    };

    // --- Car summary ---
    const carSummary = {
      totalCars,

      byEco: ecoGroups?.map((c) => ({
        ecoFriendly: c.ecoFriendly,
        count: c._count.ecoFriendly,
      })),
    };

    // --- User summary ---
    const userSummary = {
      totalUsers,
      totalGuests: guestCount,
      totalHosts: hostCount,
      totalAdmins: adminCount,
    };

    // --- Dispute summary ---
    const totalDisputes = disputeGroups.reduce(
      (acc, d) => acc + d._count.status,
      0,
    );
    const disputeSummary = {
      totalDisputes,
      byStatus: disputeGroups.reduce(
        (acc, d) => {
          acc[d.status] = d._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return {
      bookingSummary,
      paymentSummary,
      carSummary,
      userSummary,
      disputeSummary,
    };
  }
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { role: true; guestProfile: true; hostProfile: true };
}>;

type UserWithHostProfile = Prisma.UserGetPayload<{
  include: { role: true; hostProfile: true };
}>;
