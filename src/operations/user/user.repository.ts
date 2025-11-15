import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HostProfileDto, UserCreteDto, UserUpdateDto } from './user.entity';
import {
  BankType,
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
  async findRoleByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }, // include the role relation
    });

    return user?.role || null;
  }

  async getDashboardSummary(
    entity?:
      | 'user'
      | 'car'
      | 'dispute'
      | 'payment'
      | 'booking'
      | 'total'
      | 'latestBookings'
      | 'graph',
    startDate?: Date,
    endDate?: Date,
    hostId?: string,
    year?: number,
  ) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const bookingWhere: any = {};
    const paymentWhere: any = {};
    const userWhere: any = {};
    const carWhere: any = {};

    if (startDate || endDate) {
      bookingWhere.createdAt = dateFilter;
      paymentWhere.createdAt = dateFilter;
      carWhere.createdAt = dateFilter;
    }

    if (hostId) {
      bookingWhere.hostId = hostId;
      paymentWhere.recipientId = hostId;
      carWhere.hostId = hostId;
    }

    // If year is provided, filter by that year
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);
      bookingWhere.createdAt = { gte: yearStart, lte: yearEnd };
      paymentWhere.createdAt = { gte: yearStart, lte: yearEnd };
    }

    // ---- TOTAL TYPE ----
    if (entity === 'total') {
      const [totalBookings, totalRevenue, totalUsers, activeHosts] =
        await Promise.all([
          this.prisma.booking.count({ where: bookingWhere }),
          this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: paymentWhere,
          }),
          this.prisma.user.count(),
          this.prisma.user.count({ where: { role: { name: 'HOST' } } }),
        ]);

      return {
        totalBookings: totalBookings || 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalUsers: totalUsers || 0,
        activeHosts: activeHosts || 0,
      };
    }

    // ---- LATEST BOOKINGS TYPE ----
    if (entity === 'latestBookings') {
      const latestBookingList = await this.prisma.booking.findMany({
        where: bookingWhere,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          guest: { select: { firstName: true, lastName: true, id: true } },
          host: { select: { firstName: true, lastName: true, id: true } },
          car: {
            select: {
              make: { select: { name: true } },
              model: { select: { name: true } },
            },
          },
          totalPrice: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      });

      return latestBookingList;
    }

    // ---- GRAPH TYPE ----
    if (entity === 'graph') {
      // Determine the year: use `year` param or current year
      const graphYear = year || new Date().getFullYear();
      const yearStart = new Date(graphYear, 0, 1);
      const yearEnd = new Date(graphYear, 11, 31, 23, 59, 59);

      const graphWhere = {
        ...paymentWhere,
        createdAt: { gte: yearStart, lte: yearEnd },
      };

      // Get revenue grouped by createdAt
      const revenueData = await this.prisma.payment.groupBy({
        by: ['createdAt'],
        where: graphWhere,
        _sum: { amount: true },
      });

      // Initialize all months to 0
      const monthlyRevenue: Record<string, number> = {};
      for (let month = 0; month < 12; month++) {
        const key = `${graphYear}-${(month + 1).toString().padStart(2, '0')}`;
        monthlyRevenue[key] = 0;
      }

      // Populate with actual revenue
      revenueData.forEach((r) => {
        const date = new Date(r.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
        monthlyRevenue[monthKey] += r._sum.amount || 0;
      });

      return monthlyRevenue;
    }

    // ---- OTHER ENTITIES ----
    const summary: Record<string, any> = {};

    // --- Booking summary ---
    if (!entity || entity === 'booking') {
      const bookingGroups = await this.prisma.booking.groupBy({
        by: ['status'],
        where: bookingWhere,
        _count: { status: true },
      });
      summary.booking = {
        totalBookings:
          bookingGroups?.reduce((acc, b) => acc + b._count.status, 0) || 0,
        pending:
          bookingGroups?.find((b) => b.status === 'PENDING')?._count.status ||
          0,
        completed:
          bookingGroups?.find((b) => b.status === 'COMPLETED')?._count.status ||
          0,
        cancelledByGuest:
          bookingGroups?.find((b) => b.status === 'CANCELLED_BY_GUEST')?._count
            .status || 0,
        cancelledByHost:
          bookingGroups?.find((b) => b.status === 'CANCELLED_BY_HOST')?._count
            .status || 0,
        cancelledByAdmin:
          bookingGroups?.find((b) => b.status === 'CANCELLED_BY_ADMIN')?._count
            .status || 0,
      };
    }

    // --- Payment summary ---
    if (!entity || entity === 'payment') {
      const [paymentGroups, paymentTotals] = await Promise.all([
        this.prisma.payment.groupBy({
          by: ['status'],
          where: paymentWhere,
          _count: { status: true },
        }),
        this.prisma.payment.aggregate({
          _sum: {
            amount: true,
            insuranceFee: true,
            platformFee: true,
            hostEarnings: true,
          },
          where: paymentWhere,
        }),
      ]);

      summary.payment = {
        totalPayments:
          paymentGroups?.reduce((acc, p) => acc + p._count.status, 0) || 0,
        pending:
          paymentGroups?.find((p) => p.status === 'PENDING')?._count.status ||
          0,
        completed:
          paymentGroups?.find((p) => p.status === 'COMPLETED')?._count.status ||
          0,
        failed:
          paymentGroups?.find((p) => p.status === 'FAILED')?._count.status || 0,
        refunded:
          paymentGroups?.find((p) => p.status === 'REFUNDED')?._count.status ||
          0,
        totals: {
          amount: paymentTotals._sum.amount || 0,
          insuranceFee: paymentTotals._sum.insuranceFee || 0,
          platformFee: paymentTotals._sum.platformFee || 0,
          hostEarnings: paymentTotals._sum.hostEarnings || 0,
        },
      };
    }

    // --- Car summary ---
    if (!entity || entity === 'car') {
      const ecoGroups = await this.prisma.car.groupBy({
        by: ['ecoFriendly'],
        where: carWhere,
        _count: { ecoFriendly: true },
      });
      const totalCars = await this.prisma.car.count({ where: carWhere });

      summary.car = {
        totalCars,
        byEco: ecoGroups?.map((c) => ({
          ecoFriendly: c.ecoFriendly,
          count: c._count.ecoFriendly,
        })),
      };
    }

    // --- User summary ---
    if (!entity || entity === 'user') {
      const [totalUsers, guestCount, hostCount, adminCount] = await Promise.all(
        [
          this.prisma.user.count({ where: userWhere }),
          this.prisma.user.count({ where: { role: { name: 'GUEST' } } }),
          this.prisma.user.count({ where: { role: { name: 'HOST' } } }),
          this.prisma.user.count({ where: { role: { name: 'ADMIN' } } }),
        ],
      );

      summary.user = {
        totalUsers,
        totalGuests: guestCount,
        totalHosts: hostCount,
        totalAdmins: adminCount,
      };
    }

    // --- Dispute summary ---
    if (!entity || entity === 'dispute') {
      const disputeGroups = await this.prisma.dispute.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      const totalDisputes = disputeGroups.reduce(
        (acc, d) => acc + d._count.status,
        0,
      );
      summary.dispute = {
        totalDisputes,
        byStatus: disputeGroups.reduce(
          (acc, d) => {
            acc[d.status] = d._count.status;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    }

    return summary;
  }

  async findByHost(hostId: string, query: queryDto.ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: query.search,
      filter: query.filter,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
      searchableFields: ['method', 'status', 'transactionId'],
    });

    const { where, skip, take, orderBy } = feature.getQuery();

    const [models, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { ...where, hostId },
        skip,
        take,
        orderBy,
      }),
      this.prisma.payout.count({ where: { ...where, hostId } }),
    ]);

    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async findPayouts(query: queryDto.ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: query.search,
      filter: query.filter,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
      searchableFields: ['accountNumber', 'host.firstName', 'host.lastName'],
    });

    const { where, skip, take, orderBy } = feature.getQuery();

    const [models, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { ...where },
        skip,
        take,
        orderBy,
      }),
      this.prisma.payout.count({ where: { ...where } }),
    ]);

    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async create(
    hostId: string,
    amount: number,
    accountNumber: string,
    bankType: BankType,
  ) {
    return this.prisma.payout.create({
      data: {
        hostId,
        amount,
        accountNumber,
        bankType: bankType,
        status: 'PENDING',
      },
    });
  }

  async findPayOutById(id: string) {
    return this.prisma.payout.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string, reason?: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status, reason },
    });
  }

  async updateHostEarnings(hostId: string, newEarnings: number) {
    return this.prisma.hostProfile.update({
      where: { userId: hostId },
      data: { earnings: newEarnings },
    });
  }
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { role: true; guestProfile: true; hostProfile: true };
}>;

type UserWithHostProfile = Prisma.UserGetPayload<{
  include: { role: true; hostProfile: true };
}>;
