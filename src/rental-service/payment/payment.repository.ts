import { Inject, Injectable } from '@nestjs/common';

import { NotificationType, PaymentStatus, PaymentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, PaymentConfirmDto } from './payment.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { REDIS_CLIENT } from '../../notify-hub/redis/redis.constants';
import { Redis } from 'ioredis';

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  private async notifyUser(
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      id: string;
    },
    paymentId?: string,
  ) {
    await this.redisClient.publish(
      'notifications',
      JSON.stringify({ userId, notification }),
    );
  }

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        payerId: dto.payerId,
        recipientId: dto.recipientId,
        amount: dto.amount,
        currency: dto.currency || 'ETB',
        method: dto.method,
        type: dto.type,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async releaseToHost(bookingId: string, hostId: string) {
    const bookingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!bookingPayment) throw new Error('Booking payment not found');

    const platformFee = bookingPayment.amount * 0.1; // 10% fee
    const hostEarnings = bookingPayment.amount - platformFee;

    // Create payment transaction
    return this.prisma.$transaction(async (tx) => {
      const hostProfile = await tx.hostProfile.findUnique({
        where: { userId: hostId },
      });
      const payment = await tx.payment.update({
        where: { bookingId: bookingId },
        data: {
          status: 'COMPLETED',
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: bookingPayment?.id!,
          type: 'PLATFORM_TO_HOST',
          amount: bookingPayment?.hostEarnings!,
          status: 'COMPLETED',
        },
      });

      // Update host earnings
      await tx.hostProfile.update({
        where: { userId: hostId },
        data: {
          earnings:
            (hostProfile?.earnings || 0) + bookingPayment?.hostEarnings!,
        },
      });

      const notification = await tx.notification.create({
        data: {
          userId: hostId,
          type: NotificationType.PAYMENT,
          title: 'Payment Released',
          message:
            'Your earnings for the completed booking have been released.',
          paymentId: payment.id || null,
        },
      });
      await this.notifyUser(
        hostId,
        {
          id: notification.id,
          type: NotificationType.PAYMENT,
          title: 'Payment Released',
          message:
            'Your earnings for the completed booking have been released.',
        },
        payment.id,
      );
    });
  }

  async refund(bookingId: string, refundAmount: number, reason?: string) {
    const bookingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!bookingPayment) throw new Error('Booking payment not found');

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { bookingId: bookingId },
        data: {
          status: 'REFUNDED',
          method: 'CBE',
          type: 'REFUND',
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: bookingPayment?.id!,
          type: 'REFUND',
          amount: refundAmount,
          status: 'COMPLETED',
        },
      });

      const notification = await tx.notification.create({
        data: {
          userId: payment.payerId!,
          type: NotificationType.PAYMENT,
          title: 'Payment Refunded',
          message: `Your payment has been refunded successfully.`,
          paymentId: payment.id || null,
        },
      });
      await this.notifyUser(
        payment.payerId!,
        {
          id: notification.id,
          type: NotificationType.PAYMENT,
          title: 'Payment Refunded',
          message: `Your payment has been refunded successfully.`,
        },
        payment.id,
      );
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        disputes: true,
        booking: true,
        transactions: true,
        payer: true,
        recipient: true,
      },
    });
  }

  async findByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: { disputes: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { OR: [{ payerId: userId }, { recipientId: userId }] },
      include: { booking: true, disputes: true },
    });
  }

  async findAll(filter: ListQueryDto) {
    console.log('filterr: ', filter);
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: [
        'payer.phone',
        'payer.firstName',
        'payer.lastName',
        'recipient.firstName',
        'recipient.lastName',
        'recipient.phone',
      ],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.payment.findMany({
        ...query,
        include: { payer: true, recipient: true },
        where: query.where || {},
      }),
      this.prisma.payment.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }
  async completePayment(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // console.log('idididL:', id);
      // return;
      // 1️⃣ Update the payment record
      const payment = await tx.payment.update({
        where: { bookingId: id },
        data: {
          status: 'COMPLETED',
          method: 'CBE',
          transactionId: Math.random().toString(),
        },
      });

      // 2️⃣ Record a new transaction log
      const paymentTransaction = await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'CAPTURE',
          amount: payment.amount,
          status: 'COMPLETED',
        },
      });
      if (payment.recipientId) {
        const notification = await tx.notification.create({
          data: {
            userId: payment.recipientId!,
            type: NotificationType.PAYMENT,
            title: 'Payment Completed',
            message: 'Payment for the booking has been successfully completed.',
            paymentId: payment.id || null,
          },
        });
        await this.notifyUser(
          payment.recipientId,
          {
            id: notification.id,
            type: NotificationType.PAYMENT,
            title: 'Payment Completed',
            message: 'Payment for the booking has been successfully completed.',
          },
          payment.id,
        );
      }

      // 4️⃣ Optionally: Notify host
      // await this.notificationService.notifyHost(booking.hostId, { ... });

      return { payment, paymentTransaction };
    });
  }
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}
