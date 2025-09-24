// booking.message.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { BookingUseCasesImp } from './booking.usecase.impl';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { BookingChangeStatusDto } from './booking.entity';

@Controller()
export class BookingMessageController {
  constructor(private readonly usecases: BookingUseCasesImp) {}

  @MessagePattern(PATTERNS.BOOKING_CREATE)
  async createBooking(@Payload() payload: any) {
    try {
      const res = await this.usecases.createBooking(payload);
      return IResponse.success('Booking created successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_UPDATE)
  async updateBooking(@Payload() payload: { id: string; data: any }) {
    try {
      const res = await this.usecases.updateBooking(payload.id, payload.data);
      return IResponse.success('Booking updated successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_DELETE)
  async deleteBooking(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.deleteBooking(payload.id);
      return IResponse.success('Booking deleted successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_GET_BY_ID)
  async getBookingById(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.getBookingById(payload.id);
      return IResponse.success('Booking fetched successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_GET_ALL)
  async getAllBookings(
    @Payload() payload: { page?: number; pageSize?: number },
  ) {
    try {
      const skip = ((payload?.page ?? 1) - 1) * (payload?.pageSize ?? 10);
      const take = payload?.pageSize ?? 10;
      const { bookings, total } = await this.usecases.getAllBookings(
        skip,
        take,
      );
      return IResponse.success('Bookings fetched successfully', {
        bookings,
        total,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_CANCEL_BY_GUEST)
  async cancelByGuest(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.cancelByGuest(payload.id);
      return IResponse.success('Booking cancelled by guest', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_CONFIRM_BY_HOST)
  async confirmByHost(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.confirmByHost(payload.id);
      return IResponse.success('Booking confirmed by host', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_REJECT_BY_HOST)
  async rejectByHost(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.rejectByHost(payload.id);
      return IResponse.success('Booking rejected by host', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_CANCEL_BY_HOST)
  async cancelByHost(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.cancelByHost(payload.id);
      return IResponse.success('Booking cancelled by host', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_COMPLETE_BY_HOST)
  async completeByHost(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.completeByHost(payload.id);
      return IResponse.success('Booking completed successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_CANCEL_BY_ADMIN)
  async cancelByAdmin(
    @Payload() payload: { id: string; dto: BookingChangeStatusDto },
  ) {
    try {
      const res = await this.usecases.cancelByAdmin(payload.id, payload.dto);
      return IResponse.success('Booking cancelled by admin', res);
    } catch (error) {
      handleCatch(error);
    }
  }
}
