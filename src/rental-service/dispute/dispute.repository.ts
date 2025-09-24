import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dispute.entity';

@Injectable()
export class DisputeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto) {
    return this.prisma.dispute.create({
      data: {
        userId: dto.userId,
        bookingId: dto.bookingId,
        paymentId: dto.paymentId,
        carId: dto.carId,
        reason: dto.reason,
      },
    });
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

  async findAll() {
    return this.prisma.dispute.findMany({
      include: { user: true, car: true, booking: true, payment: true },
    });
  }

  async updateStatus(disputeId: string, status: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status },
    });
  }
}
