import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './payment.entity';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class PaymentUseCasesImpl {
  constructor(private readonly repo: PaymentRepository) {}

  async createPayment(dto: CreatePaymentDto) {
    return this.repo.create(dto);
  }

  async releaseToHost(bookingId: string, hostId: string) {
    return this.repo.releaseToHost(bookingId, hostId);
  }

  async completePayment(bookingId: string) {
    return this.repo.completePayment(bookingId);
  }

  async refundGuest(bookingId: string, refundAmount: number, reason?: string) {
    return this.repo.refund(bookingId, refundAmount, reason);
  }

  async getPaymentById(id: string) {
    return this.repo.findById(id);
  }

  async getByBooking(bookingId: string) {
    return this.repo.findByBooking(bookingId);
  }

  async getByUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async getAllPayments(query: ListQueryDto) {
    const res = await this.repo.findAll(query);
    return {
      models: res.models,
      pagination: res.pagination,
    };
  }
}
