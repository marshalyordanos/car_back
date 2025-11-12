import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { PaymentUseCasesImpl } from './payment.usecase.impl';
import { ListQueryDto } from 'src/common/query/query.dto';
import { PermissionGuard } from 'src/common/permission.guard';
import { CheckPermission } from 'src/common/decorator/check-permission.decorator';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

@Controller()
export class PaymentMessageController {
  constructor(private readonly usecases: PaymentUseCasesImpl) {}

  @MessagePattern(PATTERNS.PAYMENT_CREATE)
  async create(@Payload() payload) {
    try {
      const res = await this.usecases.createPayment(payload);
      return IResponse.success('Payment created successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PAYMENT_COMPLETE)
  async completePayment(@Payload() payload) {
    try {
      const res = await this.usecases.completePayment(payload.bookingId);
      return IResponse.success(' Complited Sucssuesfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PAYMENT_RELEASE_TO_HOST)
  async release(@Payload() payload) {
    try {
      const res = await this.usecases.releaseToHost(
        payload.bookingId,
        payload.hostId,
        payload.user?.sub,
      );
      return IResponse.success('Host payment released', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PAYMENT_REFUND)
  async refund(@Payload() payload) {
    try {
      const res = await this.usecases.refundGuest(
        payload.bookingId,
        payload.refundAmount,
        payload.user?.sub,
        payload.reason,
      );
      return IResponse.success('Refund processed successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.READ)
  @MessagePattern(PATTERNS.PAYMENT_GET_BY_ID)
  async getById(@Payload() payload) {
    try {
      const res = await this.usecases.getPaymentById(payload.id);
      return IResponse.success('Payment fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.READ)
  @MessagePattern(PATTERNS.PAYMENT_GET_BY_BOOKING)
  async getByBooking(@Payload() payload) {
    try {
      const res = await this.usecases.getByBooking(payload.bookingId);
      return IResponse.success('Payment by booking fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.READ)
  @MessagePattern(PATTERNS.PAYMENT_GET_BY_USER)
  async getByUser(@Payload() payload) {
    try {
      const res = await this.usecases.getByUser(payload.userId);
      return IResponse.success('Payments by user fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('PAYMENT', PermissionActions.READ)
  @MessagePattern(PATTERNS.PAYMENT_GET_ALL)
  async getAll(data: { query: ListQueryDto; user: any }) {
    try {
      const result = await this.usecases.getAllPayments(
        data.query,
        data.user.sub,
      );
      return IResponse.success(
        'All payments fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      return handleCatch(error);
    }
  }
}
