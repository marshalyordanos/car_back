import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dispute.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { Dispute, NotificationType } from '@prisma/client';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../notify-hub/redis/redis.constants';

@Injectable()
export class DisputeRepository {
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
    disputeId?: string,
  ) {
    // Save notification to DB
    // await this.prisma.notification.create({
    //   data: {
    //     userId,
    //     type: notification.type,
    //     title: notification.title,
    //     message: notification.message,
    //     disputeId: disputeId || null,
    //   },
    // });

    // Publish for real-time updates via Redis
    await this.redisClient.publish(
      'notifications',
      JSON.stringify({ userId, notification }),
    );
  }
  async findById(id: string) {
    return this.prisma.dispute.findUnique({
      where: { id },
      include: { user: true, car: true, booking: true, payment: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.dispute.findMany({
      where: { userId },
      include: { car: true, booking: true, payment: true },
    });
  }

  async findBookingWithPayment(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, guest: true, host: true },
    });
  }

  async findInspectionByBookingAndType(
    bookingId: string,
    type: 'PICKUP' | 'DROPOFF',
  ) {
    return this.prisma.bookingInspection.findFirst({
      where: { bookingId, type },
    });
  }

  async findDisputeByBookingId(bookingId: string) {
    return this.prisma.dispute.findFirst({ where: { bookingId } });
  }

  async findAll(filter: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: filter.search,
      filter: filter.filter,
      sort: filter.sort,
      page: filter.page,
      pageSize: filter.pageSize,
      searchableFields: ['name', 'make.name'],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.dispute.findMany({
        ...query,
        include: { car: true, booking: true, payment: true },
        where: query.where || {},
      }),
      this.prisma.dispute.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    // console.log(models, feature.getPagination(total));
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.dispute.update({ where: { id }, data: { status } });
  }

  // Create dispute + set payment on hold + create HOLD transaction — ALL IN ONE TRANSACTION
  async createDisputeAndHoldPayment(payload: {
    bookingId: string;
    paymentId?: string;
    userId: string;
    reason: string;
    photos?: string[];
    status?: string;
  }): Promise<Dispute> {
    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          bookingId: payload.bookingId,
          paymentId: payload.paymentId ?? undefined,
          userId: payload.userId,
          reason: payload.reason,
          status: payload.status ?? 'OPEN',
        },
      });

      // 2) place payment on hold (if payment exists)
      if (payload.paymentId) {
        const py = await tx.payment.update({
          where: { id: payload.paymentId },
          data: { status: 'ON_HOLD' }, // use PaymentStatus.ON_HOLD
        });

        // 3) log a PaymentTransaction of type HOLD
        await tx.paymentTransaction.create({
          data: {
            paymentId: payload.paymentId,
            type: 'HOLD', // TransactionType.HOLD
            amount: py.amount, // amount 0 for hold record (adjust if you want to store held amount)
            status: 'PENDING',
          },
        });
      }

      const notification = await tx.notification.create({
        data: {
          userId: payload.userId,
          type: NotificationType.DISPUTE,
          title: 'Dispute Created',
          message: `Your dispute has been successfully submitted and is under review.`,
          disputeId: dispute.id || null,
        },
      });

      await this.notifyUser(
        payload.userId,
        {
          id: notification.id,
          type: NotificationType.DISPUTE,
          title: 'Dispute Created',
          message: `Your dispute has been successfully submitted and is under review.`,
        },
        dispute.id,
      );

      return dispute;
    });
  }

  // Resolve dispute with optional refund (transactional)
  async resolveDisputeWithOptionalRefund(params: {
    disputeId: string;
    adminId: string;
    refundAmount: number; // 0 -> no refund, >0 -> refund that amount
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // ensure dispute exists
      const dispute = await tx.dispute.findUnique({
        where: { id: params.disputeId },
        include: { booking: true, payment: true },
      });
      if (!dispute) throw new Error('Dispute not found');

      // 1) mark dispute resolved
      const updated = await tx.dispute.update({
        where: { id: params.disputeId },
        data: { status: 'RESOLVED' },
      });

      // 2) if refundAmount > 0, update payment status and create refund transaction
      if (params.refundAmount > 0 && dispute.paymentId) {
        await tx.payment.update({
          where: { id: dispute.paymentId },
          data: { status: 'REFUNDED' },
        });

        await tx.paymentTransaction.create({
          data: {
            paymentId: dispute.paymentId,
            type: 'REFUND',
            amount: params.refundAmount,
            status: 'COMPLETED',
          },
        });
      } else if (dispute.paymentId) {
        // If no refund, release hold -> set payment to COMPLETED or previous state (choose appropriate)
        await tx.payment.update({
          where: { id: dispute.paymentId },
          data: { status: 'COMPLETED' },
        });

        // create transaction record for hold release (optional)
        await tx.paymentTransaction.create({
          data: {
            paymentId: dispute.paymentId,
            type: 'HOLD',
            amount: 0,
            status: 'COMPLETED',
          },
        });
      }

      // 3) record admin action
      await tx.adminAction.create({
        data: {
          adminId: params.adminId,
          targetType: 'Dispute',
          targetId: params.disputeId,
          actionType: 'RESOLVED',
          notes: params.notes ?? '',
        },
      });

      if (dispute.userId) {
        const notification = await tx.notification.create({
          data: {
            userId: dispute.userId,
            type: NotificationType.DISPUTE,
            title: 'Dispute Resolved',
            message: `Your dispute has been resolved by the admin.`,
            disputeId: dispute.id || null,
          },
        });

        await this.notifyUser(
          dispute.userId,
          {
            id: notification.id,
            type: NotificationType.DISPUTE,
            title: 'Dispute Resolved',
            message: `Your dispute has been resolved by the admin.`,
          },
          dispute.id,
        );
      }

      return updated;
    });
  }

  // Reject dispute & release hold (no refund) — transactional
  async rejectDisputeAndReleasePayment(disputeId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({ where: { id: disputeId } });
      if (!dispute) throw new Error('Dispute not found');

      // 1) update status to REJECTED
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: { status: 'REJECTED' },
      });

      // 2) if payment exists, release hold -> set payment to COMPLETED
      if (dispute.paymentId) {
        await tx.payment.update({
          where: { id: dispute.paymentId },
          data: { status: 'COMPLETED' },
        });

        // create transaction record for hold release
        await tx.paymentTransaction.create({
          data: {
            paymentId: dispute.paymentId,
            type: 'HOLD',
            amount: 0,
            status: 'COMPLETED',
          },
        });
      }

      // 3) admin action log - if your flow requires adminId here, you can adjust signature to include adminId
      await tx.adminAction.create({
        data: {
          adminId: adminId,
          targetType: 'Dispute',
          targetId: disputeId,
          actionType: 'REJECTED',
          notes: 'Dispute rejected by admin',
        },
      });

      if (dispute.userId) {
        const notification = await tx.notification.create({
          data: {
            userId: dispute.userId,
            type: NotificationType.DISPUTE,
            title: 'Dispute Rejected',
            message: `Your dispute has been rejected by the admin.`,
            disputeId: dispute.id || null,
          },
        });
        await this.notifyUser(
          dispute.userId,
          {
            id: notification.id,
            type: NotificationType.DISPUTE,
            title: 'Dispute Rejected',
            message: `Your dispute has been rejected by the admin.`,
          },
          dispute.id,
        );
      }

      return updated;
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}
