// booking.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BookingInspectionDto,
  BookingInspectionUpdateDto,
  CreateBookingDto,
  PaymentConfirmDto,
  UpdateBookingDto,
} from './booking.entity';
import {
  AdminAction,
  BookingInspection,
  BookingStatus,
  HostPenalty,
  PaymentStatus,
  PaymentTransaction,
  Prisma,
  TransactionType,
} from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class BookingRepository {
  constructor(private prisma: PrismaService) {}

  async createBooking(
    dto: CreateBookingDto,
    totalPrice: number,
    platformFee: number,
    hostEarnings: number,
  ) {
    // const pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
    // const dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;

    // return this.prisma.booking.create({
    //   data: {
    //     carId: dto.carId,
    //     guestId: dto.guestId,
    //     hostId: dto.hostId,
    //     startDate: dto.startDate,
    //     endDate: dto.endDate,
    //     totalPrice: totalPrice,
    //     withDriver: dto.withDriver ?? false,
    //     pickupLocation,
    //     dropoffLocation,
    //   },
    // });

    return this.prisma.$transaction(async (tx) => {
      // Create booking
      const pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
      const dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;

      // 1) CHECK OVERLAP BEFORE INSERT

      const conflict = await tx.booking.findFirst({
        where: {
          carId: dto.carId,
          status: 'PENDING', // only consider pending bookings
          AND: [
            { startDate: { lte: dto.endDate } }, // existing.start <= newEnd
            { endDate: { gte: dto.startDate } }, // existing.end >= newStart
          ],
        },
      });

      console.log(conflict, 'conflict');

      if (conflict) {
        throw new RpcException(
          'This car is already booked or pending in that period.',
        );
      }
      const booking = await tx.booking.create({
        data: {
          carId: dto.carId,
          guestId: dto.guestId,
          hostId: dto.hostId,
          startDate: dto.startDate,
          endDate: dto.endDate,
          totalPrice,
          withDriver: dto.withDriver ?? false,
          pickupLocation,
          dropoffLocation,
        },
      });

      // Create corresponding payment
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          payerId: dto.guestId,
          recipientId: dto.hostId,
          amount: totalPrice,
          currency: 'ETB',
          method: null,
          status: 'ON_HOLD',
          type: 'GUEST_TO_PLATFORM',
          platformFee,
          hostEarnings,
        },
      });

      const paymentTransaction = await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'CAPTURE',
          amount: payment.amount,
          status: 'COMPLETED',
        },
      });

      return booking;
    });
  }

  async updateBooking(id: string, dto: UpdateBookingDto) {
    const data: any = { ...dto };

    if (dto.pickupLat && dto.pickupLng && dto.pickupName) {
      data.pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
    }
    if (dto.dropoffLat && dto.dropoffLng && dto.dropoffName) {
      data.dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        startDate: dto.startDate ?? undefined,
        endDate: dto.endDate ?? undefined,
        withDriver: dto.withDriver ?? undefined,
        pickupLocation: data.pickupLocation ?? undefined,
        dropoffLocation: data.dropoffLocation ?? undefined,
      },
    });
  }

  async deleteBooking(id: string) {
    const res = await this.prisma.booking.deleteMany({
      where: { id, status: 'PENDING' },
    });

    if (res.count === 0) {
      throw new RpcException('Booking cannot be deleted (not pending).');
    }
    return res;
  }

  async getBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: { include: { make: true, model: true } },
        guest: true,
        host: true,
        payment: true,
        dispute: true,
        inspections: true,
      },
    });
  }

  async getMyBookings(filter: ListQueryDto, userId: string) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: ['guest.phone', 'host.phone'],
      dateFields: ['startDate', 'endDate', 'createdAt'],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.booking.findMany({
        ...query,
        include: {
          car: { include: { make: true, model: true } },
          guest: true,
          host: true,
          payment: true,
          dispute: true,
          inspections: true,
        },
        where: query.where || {},
      }),
      this.prisma.booking.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async getAllBookings(filter: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: [
        'guest.phone',
        'host.phone',
        'host.firstName',
        'guest.firstName',
        'car.make.name',
      ],
      dateFields: ['startDate', 'endDate', 'createdAt'],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.booking.findMany({
        ...query,
        include: {
          car: { include: { make: true, model: true } },
          guest: true,
          host: true,
          payment: true,
          dispute: true,
          inspections: true,
        },
        where: query.where || {},
      }),
      this.prisma.booking.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async changeStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
  async changeStatusToConfirm(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Update booking to confirmed
      const booking = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CONFIRMED },
      });

      // Optionally, notify the guest
      // await this.notificationService.notifyGuest(booking.guestId, {
      //   type: 'BOOKING_CONFIRMED',
      //   message: `Your booking has been confirmed by the host.`,
      // });

      return booking;
    });
  }

  async changeStatusToReject(id: string, status: BookingStatus) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Update booking status
      const booking = await tx.booking.update({
        where: { id },
        data: { status },
      });

      // 2️⃣ If rejected → delete pending payments
      if (status === 'REJECTED')
        await tx.payment.deleteMany({
          where: {
            bookingId: id,
            status: 'PENDING',
          },
        });

      // 3️⃣ Optionally: send notification (pseudo — can integrate with a service)
      // await this.notificationService.notifyGuest(booking.guestId, {
      //   type: 'BOOKING_REJECTED',
      //   message: `Your booking for ${booking.id} has been rejected.`,
      // });

      // 4️⃣ Return final booking object
      return booking;
    });
  }

  // ....................................... inception .......................................
  async createInspection(
    data: BookingInspectionDto,
    submittedById: string,
  ): Promise<BookingInspection> {
    return this.prisma.bookingInspection.create({
      data: {
        booking: { connect: { id: data.bookingId } }, // map bookingId to relation
        submittedBy: { connect: { id: submittedById } }, // map submittedById to relation
        type: data.type,
        // photos: data.photos,
        fuelLevel: data.fuelLevel,
        mileage: data.mileage,
        approved: false, // default to false
      },
    });
  }

  async updateInspection(
    data: BookingInspectionUpdateDto,
    submittedById: string,
    id: string,
  ): Promise<BookingInspection> {
    return this.prisma.bookingInspection.update({
      where: { id: id },
      data: { fuelLevel: data.fuelLevel, mileage: data.mileage },
    });
  }

  async findById(id: string): Promise<BookingInspection | null> {
    return this.prisma.bookingInspection.findUnique({ where: { id } });
  }

  async findAll(filter: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: [],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.bookingInspection.findMany({
        ...query,
        include: { approvedBy: true },
        where: query.where || {},
      }),
      this.prisma.bookingInspection.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async findByBookingId(bookingId: string): Promise<BookingInspection[]> {
    return this.prisma.bookingInspection.findMany({ where: { bookingId } });
  }

  async markBookingCompleted(bookingId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
    });
  }
  async findInspectionByBookingAndType(
    bookingId: string,
    type: 'PICKUP' | 'DROPOFF',
  ): Promise<BookingInspection | null> {
    return this.prisma.bookingInspection.findFirst({
      where: { bookingId, type },
    });
  }

  async approveInspectionTransaction(
    inspectionId: string,
    bookingId: string,
  ): Promise<BookingInspection> {
    return this.prisma.$transaction(async (tx) => {
      // Approve inspection
      const approvedInspection = await tx.bookingInspection.update({
        where: { id: inspectionId },
        data: { approved: true },
      });

      // Check if both PICKUP and DROPOFF are approved
      const inspections = await tx.bookingInspection.findMany({
        where: { bookingId, type: 'DROPOFF' },
      });
      const allApproved = inspections.every((i) => i.approved);

      if (inspections.length > 0 && allApproved) {
        // Complete booking

        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.COMPLETED },
          include: { payment: true }, // include the related Payment
        });

        // Calculate host earnings
        console.log('booking.hostId : ', booking.hostId);
        const hostProfile = await tx.hostProfile.findUnique({
          where: { userId: booking.hostId },
        });
        console.log('booking.hostId22 : ', hostProfile);

        // Create payment transaction
        await tx.paymentTransaction.create({
          data: {
            paymentId: booking.payment?.id!,
            type: 'PLATFORM_TO_HOST',
            amount: booking.payment?.hostEarnings!,
            status: 'COMPLETED',
          },
        });

        // Update host earnings
        await tx.hostProfile.update({
          where: { userId: booking.hostId },
          data: {
            earnings:
              (hostProfile?.earnings || 0) + booking.payment?.hostEarnings!,
          },
        });
      }

      return approvedInspection;
    });
  }

  // ********************************* canclation ************************************
  // ********************************             *********************************

  async findBookingWithPayment(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { payment: true, guest: true, host: true },
    });
  }

  async getCancellationPolicy(userType: 'GUEST' | 'HOST') {
    return this.prisma.cancellationPolicy.findMany({
      where: { userType },
      orderBy: { daysBeforeTrip: 'desc' },
    });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  }

  async createPaymentTransaction(data: {
    paymentId: string;
    type: TransactionType;
    amount: number;
    status: PaymentStatus;
  }): Promise<PaymentTransaction> {
    return this.prisma.paymentTransaction.create({ data });
  }

  async createHostPenalty(data: {
    hostId: string;
    bookingId: string;
    amount: number;
    reason: string;
  }): Promise<HostPenalty> {
    return this.prisma.hostPenalty.create({ data });
  }

  async createAdminAction(data: {
    adminId: string;
    targetType: string;
    targetId: string;
    actionType: string;
    notes?: string;
  }): Promise<AdminAction> {
    return this.prisma.adminAction.create({ data });
  }

  async updateHostEarnings(hostId: string, amount: number) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { id: hostId },
    });
    if (!hostProfile) return null;
    return this.prisma.hostProfile.update({
      where: { id: hostId },
      data: { earnings: hostProfile.earnings + amount },
    });
  }

  async runTransaction(actions: (tx: typeof this.prisma) => Promise<any>) {
    return this.prisma.$transaction(actions);
  }
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id: id },
      include: { role: true },
    });
  }
  async getBookingSummary() {
    const totalBookings = await this.prisma.booking.count();
    const statusCounts = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return {
      totalBookings,
      ...statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
    };
  }
}
