import { Injectable } from '@nestjs/common';

import { PaymentStatus, PaymentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.payment.create({
      data: {
        bookingId,
        payerId: null,
        recipientId: hostId,
        amount: hostEarnings,
        currency: bookingPayment.currency,
        method: bookingPayment.method,
        type: PaymentType.PLATFORM_TO_HOST,
        platformFee,
        hostEarnings,
        status: PaymentStatus.CONFIRMED,
      },
    });
  }

  async refund(bookingId: string, refundAmount: number, reason?: string) {
    const bookingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!bookingPayment) throw new Error('Booking payment not found');

    return this.prisma.payment.create({
      data: {
        bookingId,
        payerId: null,
        recipientId: bookingPayment.payerId,
        amount: refundAmount,
        currency: bookingPayment.currency,
        method: bookingPayment.method,
        type: PaymentType.REFUND,
        status: PaymentStatus.CONFIRMED,
        transactionId: `refund_${Date.now()}`,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { disputes: true, booking: true },
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

  async findAll() {
    return this.prisma.payment.findMany({
      include: { booking: true, disputes: true },
    });
  }
}
