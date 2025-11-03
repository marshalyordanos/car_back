import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './payment.entity';
import { ListQueryDto } from 'src/common/query/query.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentUseCasesImpl {
  constructor(private readonly repo: PaymentRepository) {}

  async createPayment(dto: CreatePaymentDto) {
    return this.repo.create(dto);
  }

  async releaseToHost(bookingId: string, hostId: string, userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new RpcException('User is not found!');
    }
    if (user.role?.name == 'GUEST' || user.role?.name == 'HOST') {
      throw new RpcException('Have not permission!');
    }

    return this.repo.releaseToHost(bookingId, hostId);
  }

  async completePayment(bookingId: string) {
    return this.repo.completePayment(bookingId);
  }

  async refundGuest(
    bookingId: string,
    refundAmount: number,
    userId: string,
    reason?: string,
  ) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new RpcException('User is not found!');
    }
    if (user.role?.name == 'GUEST' || user.role?.name == 'HOST') {
      throw new RpcException('Have not permission!');
    }

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

  async getAllPayments(query: ListQueryDto, userId: string) {
    const user = await this.repo.findUserById(userId);

    if (user?.role?.name == 'HOST') {
      const currentFilter = query.filter ?? '';

      if (/recipientId:[^,]*/.test(currentFilter)) {
        query.filter = currentFilter.replace(
          /recipientId:[^,]*/,
          `recipientId:${userId}`,
        );
      } else {
        query.filter = currentFilter
          ? currentFilter + `,recipientId:${userId}`
          : `recipientId:${userId}`;
      }

      // console.log('query.filter: ', query.filter, currentFilter);
      // if (/payerId:[^,]*/.test(currentFilter)) {
      //   query.filter = currentFilter.replace(
      //     /payerId:[^,]*/,
      //     `payerId:${userId}`,
      //   );
      // } else {
      //   query.filter = currentFilter
      //     ? currentFilter + `,payerId:${userId}`
      //     : `payerId:${userId}`;
      // }
    }

    const res = await this.repo.findAll(query);
    return {
      models: res.models,
      pagination: res.pagination,
    };
  }
}
