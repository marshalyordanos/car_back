// booking.repository.ts
import { Inject, Injectable } from '@nestjs/common';
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
  Booking,
  BookingInspection,
  BookingStatus,
  HostPenalty,
  NotificationType,
  Payment,
  PaymentStatus,
  PaymentTransaction,
  Prisma,
  TransactionType,
} from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../notify-hub/redis/redis.constants';
import { createId as cuid } from '@paralleldrive/cuid2';
import axios from 'axios';
import { sendSms } from '../../utils/sendSms';

@Injectable()
export class BookingRepository {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  // booking.repository.ts (partial)
  private async notifyUser(
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      id: string;
    },
    bookingId?: string, // optional
  ) {
    // Save to database

    // Publish to Redis for real-time update
    await this.redisClient.publish(
      'notifications',
      JSON.stringify({ userId, notification }),
    );
  }

  private generateBookingCode(counter: number) {
    const year = new Date().getFullYear();
    const paddedCounter = String(counter).padStart(7, '0');
    return `BK-${year}-${paddedCounter}`;
  }

  async createBooking(
    dto: CreateBookingDto,
    totalPrice: number,
    platformFee: number,
    hostEarnings: number,
    userId?: string,
    files?: {
      driverLicenseId?: string;
      nationalId?: string;
    },
  ) {
    console.log('process.env.DO_SPACES_KEY', process.env.DO_SPACES_KEY);
    // 1️⃣ Perform booking + payment creation in a transaction
    return await this.prisma.$transaction(
      async (tx) => {
        console.log('000000000000000000000001:', userId);
        let isLoggedInUser = true;
        if (!userId) {
          const { firstName, lastName, email, phone } = dto;

          const role = await tx.role.findUnique({
            where: { name: 'GUEST' },
          });

          const guest = await tx.user.upsert({
            where: { phone }, // find by phone
            update: {
              firstName: firstName!,
              lastName: lastName!,
              email: email!,
              phone,
              guestProfile: {
                upsert: {
                  create: {
                    driverLicenseId: files?.driverLicenseId,
                    nationalId: files?.nationalId,
                  },
                  update: {
                    driverLicenseId: files?.driverLicenseId,
                    nationalId: files?.nationalId,
                  },
                },
              },
              role: role?.id ? { connect: { id: role.id } } : undefined,
            },
            create: {
              firstName: firstName!,
              lastName: lastName!,
              email: email!,
              phone,
              guestProfile: {
                create: {
                  driverLicenseId: files?.driverLicenseId,
                  nationalId: files?.nationalId,
                },
              },
              role: role?.id ? { connect: { id: role.id } } : undefined,
            },
          });

          dto.guestId = guest.id;
          isLoggedInUser = false;
        }
        console.log('000000000000000000000002:');

        const year = new Date().getFullYear();
        const bookingCount = await tx.booking.count({
          where: {
            createdAt: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${year + 1}-01-01`),
            },
          },
        });

        const trackingCode = this.generateBookingCode(bookingCount + 1);

        const pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
        const dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;

        // const conflict = await tx.booking.findFirst({
        //   where: {
        //     carId: dto.carId,
        //     status: 'PENDING',
        //     AND: [
        //       { startDate: { lte: dto.endDate } },
        //       { endDate: { gte: dto.startDate } },
        //     ],
        //   },
        //   include: { payment: true },
        // });
        const conflict = await tx.booking.findFirst({
          where: {
            carId: dto.carId,
            status: 'PENDING',
            AND: [
              { startDate: { lte: dto.endDate } },
              { endDate: { gte: dto.startDate } },
              // Only consider bookings where payment is NOT pending
              {
                payment: {
                  status: { not: 'PENDING' },
                },
              },
            ],
          },
          include: { payment: true },
        });

        console.log('000000000000000000000003:');

        if (conflict) {
          if (conflict.payment?.status == 'PENDING') {
          } else {
            throw new RpcException(
              'This car is already booked or pending in that period.',
            );
          }
        }

        let payment;
        let booking;
        let txRef = cuid();

        if (!conflict) {
          booking = await tx.booking.create({
            data: {
              carId: dto.carId,
              guestId: dto.guestId!,
              hostId: dto.hostId,
              startDate: dto.startDate,
              endDate: dto.endDate,
              totalPrice,
              withDriver: dto.withDriver ?? false,
              pickupLocation,
              dropoffLocation,
              trackingCode,
              isLoggedInUser,
            },
          });

          payment = await tx.payment.create({
            data: {
              bookingId: booking.id,
              payerId: dto.guestId,
              recipientId: dto.hostId,
              amount: totalPrice,
              currency: 'ETB',
              method: null,
              status: 'PENDING',
              type: 'GUEST_TO_PLATFORM',
              platformFee,
              hostEarnings,
            },
          });
        } else {
          booking = await tx.booking.findFirst({
            where: {
              carId: dto.carId,
              guestId: dto.guestId!,
              hostId: dto.hostId,
              startDate: dto.startDate,
              endDate: dto.endDate,
              totalPrice,
            },
          });

          console.log('000000000000000000000004---:', booking);

          payment = await tx.payment.findFirst({
            where: {
              bookingId: booking.id,
            },
          });

          await tx.payment.update({
            where: { id: payment?.id! },
            data: { transactionId: txRef },
          });
        }

        console.log('000000000000000000000004:', payment);

        const chapaData = {
          amount: payment.amount,
          currency: 'ETB',
          tx_ref: txRef,
          callback_url: `https://api.wheellol.com/bookings/chapa-callback`,
          'customization[title]': 'Car Rental Booking',
          'customization[description]': 'Payment for car booking',
          phone_number: dto.phone,
          return_url: `https://api.wheellol.com/bookings/confirmation`,
        };

        try {
          const chapaResponse = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            chapaData,
            {
              headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, //secret
                'Content-Type': 'application/json',
              },
            },
          );

          console.log('000000000000000000000005:', chapaResponse);

          const data = chapaResponse.data;

          if (data?.status !== 'success') {
            throw new RpcException('Chapa initialization failed');
          }

          console.log('=====================cahapa:', data);

          // ddd;

          // Update payment with tx_ref + checkout URL
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              transactionId: txRef,
              status: 'PENDING',
            },
          });

          if (!conflict) {
            await sendSms(`${trackingCode}`, dto.phone!);
          }

          // Return booking and Chapa checkout URL
          return {
            ...booking,
            paymentMethod: 'CHAPA',
            chapaCheckoutUrl: data?.data?.checkout_url,
          };
        } catch (err: any) {
          console.error('Chapa error:', err.response?.data || err.message);
          throw new RpcException('Failed to initialize Chapa payment');
        }
        // await tx.paymentTransaction.create({
        //   data: {
        //     paymentId: payment.id,
        //     type: 'CAPTURE',
        //     amount: payment.amount,
        //     status: 'COMPLETED',
        //   },
        // });

        // const notification = await tx.notification.create({
        //   data: {
        //     userId: booking.hostId,
        //     type: NotificationType.BOOKING,
        //     title: 'New Booking Request',
        //     message: 'You have a new booking request from a guest.',
        //     bookingId: booking.id, // associate if needed, but not shown in message
        //   },
        // });

        // await this.notifyUser(
        //   booking.hostId,
        //   {
        //     id: notification.id,
        //     type: NotificationType.BOOKING,
        //     title: 'New Booking Request',
        //     message: `You have a new booking request from a guest.`,
        //   },
        //   booking.id,
        // );

        // return booking from transaction
      },
      {
        timeout: 20000, // 10 seconds
      },
    );

    // 2️⃣ Notify user AFTER transaction success
  }

  async pay(phone: string, payment: Payment) {
    // 1️⃣ Perform booking + payment creation in a transaction
    return await this.prisma.$transaction(async (tx) => {
      const chapaData = {
        amount: payment.amount,
        currency: 'ETB',
        tx_ref: payment.transactionId,
        callback_url: `https://api.wheellol.com/bookings/chapa-callback`,
        'customization[title]': 'Car Rental Booking',
        'customization[description]': 'Payment for car booking',
        phone_number: phone,
        return_url: `https://api.wheellol.com/bookings/confirmation`,
      };

      try {
        const chapaResponse = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          chapaData,
          {
            headers: {
              Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('000000000000000000000005:');

        const data = chapaResponse.data;

        if (data?.status !== 'success') {
          throw new RpcException('Chapa initialization failed');
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            transactionId: payment.transactionId,
            status: 'PENDING',
          },
        });

        // await sendSms(`${trackingCode}`, '+251986680094');

        return {
          paymentMethod: 'CHAPA',
          chapaCheckoutUrl: data?.data?.checkout_url,
        };
      } catch (err: any) {
        console.error('Chapa error:', err.response?.data || err.message);
        throw new RpcException('Failed to initialize Chapa payment');
      }
    });

    // 2️⃣ Notify user AFTER transaction success
  }
  async handleChapaCallback(data: any) {
    // 1️⃣ Validate body
    console.log(
      '=========================================1:handleChapaCallback ',
      data,
    );
    if (!data || !data.trx_ref || !data.status) {
      throw new RpcException('Invalid Chapa payload');
    }

    // 2️⃣ Lookup payment record by trx_ref
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId: data.trx_ref },
      include: { booking: true },
    });

    if (!payment) {
      throw new RpcException('Payment not found');
    }

    // 3️⃣ Optionally verify transaction with Chapa (security check)
    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${data.trx_ref}`;
    let verifiedStatus = data.status;

    try {
      const verifyResponse = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (verifyResponse.data?.status === 'success') {
        verifiedStatus = verifyResponse.data?.data?.status ?? data.status;
      }
    } catch (error) {
      console.warn('⚠️ Chapa verification failed, fallback to callback data');
    }

    // 4️⃣ Update payment and booking within transaction
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: verifiedStatus === 'success' ? 'COMPLETED' : 'FAILED',
        },

        include: { booking: true },
      });

      if (verifiedStatus === 'success') {
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'CAPTURE',
            amount: payment.amount,
            status: 'COMPLETED',
          },
        });

        const notification = await tx.notification.create({
          data: {
            userId: updatedPayment?.booking!.hostId,
            type: NotificationType.BOOKING,
            title: 'New Booking Request',
            message: 'You have a new booking request from a guest.',
            bookingId: updatedPayment.booking!.id, // associate if needed, but not shown in message
          },
        });

        await this.notifyUser(
          updatedPayment.booking!.hostId,
          {
            id: notification.id,
            type: NotificationType.BOOKING,
            title: 'New Booking Request',
            message: `You have a new booking request from a guest.`,
          },
          updatedPayment.booking!.id,
        );

        // await tx.booking.update({
        //   where: { id: payment.bookingId },
        //   data: { status: 'PAID' },
        // });

        // // Optional: send notifications here
        // console.log(
        //   `✅ Booking ${payment.booking.trackingCode} marked as paid via Chapa.`,
        // );
      }

      return updatedPayment;
    });
  }

  async verifyChapaTransaction(txRef: string) {
    const chapaSecretKey = 'CHASECK-8sPVz2pL6LMiq2S76nk2NRdOX5ZfpxcG';

    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${txRef}`;

    try {
      const response = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (!data || !data.status) {
        throw new RpcException('Invalid Chapa verification response');
      }

      // ✅ Optional: handle success vs failure
      if (data.status !== 'success') {
        throw new RpcException(`Chapa verification failed: ${data.message}`);
      }

      return data; // Return verified data (matches Django’s Response(data, status=200))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Network or API response error
        const errMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        throw new RpcException(`Chapa verify error: ${errMsg}`);
      }

      // Unexpected or JSON parsing error
      throw new RpcException('Unexpected error verifying Chapa transaction');
    }
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
  async getBookingByCode(code: string) {
    return this.prisma.booking.findUnique({
      where: { trackingCode: code },
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
    const where: any = {
      AND: [query.where],
      OR: [
        { status: { not: 'PENDING' } }, // normal bookings
        {
          status: 'PENDING',
          payment: { status: 'COMPLETED' }, // pending bookings but payment is completed
        },
      ],
    };

    console.log(
      '--------------------2222222222222222222',
      JSON.stringify(query),
    );
    console.log(
      '--------------------2222222222222222222',
      JSON.stringify(where),
    );

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
        where: where || {},
      }),
      this.prisma.booking.count({ where: where || {} }),
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
      console.log('111111111111111111:11');

      const notification = await tx.notification.create({
        data: {
          userId: booking.guestId,
          type: NotificationType.BOOKING,
          title: 'Booking Confirmed',
          message: `Your booking has been confirmed by the host.`,
          bookingId: booking.id,
        },
      });

      console.log('111111111111111111:12');

      await this.notifyUser(
        booking.guestId,
        {
          id: notification.id,
          type: NotificationType.BOOKING,
          title: 'Booking Confirmed',
          message: `Your booking has been confirmed by the host.`,
        },
        booking.id,
      );

      console.log('111111111111111111:13');

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

      const notification = await tx.notification.create({
        data: {
          userId: booking.guestId,
          type: NotificationType.BOOKING,
          title: 'Booking Rejected',
          message: `Your booking request has been rejected by the host.`,
          bookingId: booking.id,
        },
      });
      await this.notifyUser(
        booking.guestId,
        {
          id: notification.id,
          type: NotificationType.BOOKING,
          title: 'Booking Rejected',
          message: `Your booking request has been rejected by the host.`,
        },
        booking.id,
      );
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
    approved: boolean,
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
    return this.prisma.$transaction(
      async (tx) => {
        // Approve inspection
        const approvedInspection = await tx.bookingInspection.update({
          where: { id: inspectionId },
          data: { approved: true },
        });

        console.log(
          '****************************************************************************************1',
        );

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

          console.log(
            '****************************************************************************************2',
          );

          // Calculate host earnings
          console.log('booking.hostId : ', booking.hostId);
          const hostProfile = await tx.hostProfile.findUnique({
            where: { userId: booking.hostId },
          });
          console.log('booking.hostId22 : ', hostProfile);

          console.log(
            '***************************************************************************************3',
          );

          // Create payment transaction
          await tx.paymentTransaction.create({
            data: {
              paymentId: booking.payment?.id!,
              type: 'PLATFORM_TO_HOST',
              amount: booking.payment?.hostEarnings!,
              status: 'COMPLETED',
            },
          });
          console.log(
            '****************************************************************************************4',
          );

          // Update host earnings
          await tx.hostProfile.update({
            where: { userId: booking.hostId },
            data: {
              earnings:
                (hostProfile?.earnings || 0) + booking.payment?.hostEarnings!,
            },
          });

          console.log(
            '****************************************************************************************6',
          );

          const notificationH = await tx.notification.create({
            data: {
              userId: booking.hostId,
              type: NotificationType.BOOKING,
              title: 'Booking Completed',
              message: `Booking has been completed and your earnings have been released.`,
              bookingId: booking.id,
            },
          });
          console.log(
            '****************************************************************************************7',
          );

          const notificationG = await tx.notification.create({
            data: {
              userId: booking.guestId,
              type: NotificationType.BOOKING,
              title: 'Booking Completed',
              message: `Your booking is now completed. Thank you for using our service!`,
              bookingId: booking.id,
            },
          });
          console.log(
            '****************************************************************************************8',
          );

          await this.notifyUser(
            booking.guestId,
            {
              id: notificationG.id,
              type: NotificationType.BOOKING,
              title: 'Booking Completed',
              message: `Your booking is now completed. Thank you for using our service!`,
            },
            booking.id,
          );
          console.log(
            '****************************************************************************************10',
          );

          await this.notifyUser(
            booking.hostId,
            {
              id: notificationG.id,
              type: NotificationType.BOOKING,
              title: 'Booking Completed',
              message: `Booking has been completed and your earnings have been released.`,
            },
            booking.id,
          );

          console.log(
            '****************************************************************************************11',
          );
        }

        console.log(
          '****************************************************************************************12',
        );
        return approvedInspection;
      },
      {
        timeout: 20000, // 20 seconds
      },
    );
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

  async createGust(data: CreateBookingDto) {
    const { firstName, lastName, email, phone } = data;

    const role = await this.prisma.role.findUnique({
      where: { name: 'GUEST' },
    });

    return this.prisma.user.create({
      data: {
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        phone,
        roleId: role?.id,
        // guestProfile: {
        //   create: {
        //     driverLicenseId: files?.driverLicenseId,
        //     nationalId: files?.nationalId,
        //   },
        // },
        // role: role ? { connect: { id: role } } : undefined,
      },
      include: { role: true, guestProfile: true },
    });
  }
}
