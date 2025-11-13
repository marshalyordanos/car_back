// booking.message.controller.ts
import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { BookingUseCasesImp } from './booking.usecase.impl';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import {
  BookingChangeStatusDto,
  BookingInspectionDto,
  BookingInspectionUpdateDto,
  CreateBookingDto,
} from './booking.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { Public } from '../../common/decorator/public.decorator';
import { CheckPermission } from 'src/common/decorator/check-permission.decorator';
import { PermissionActions } from 'src/contracts/permission-actions.enum';
import { PermissionGuard } from 'src/common/permission.guard';

@Controller()
export class BookingMessageController {
  constructor(private readonly usecases: BookingUseCasesImp) {}

  @MessagePattern(PATTERNS.BOOKING_CREATE)
  async createBooking(@Payload() payload: any) {
    try {
      const res = await this.usecases.createBooking(
        payload,
        payload?.user?.sub,
      );
      return IResponse.success('Booking created successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BOOKING_PAY)
  async pay(@Payload() payload: any) {
    try {
      const res = await this.usecases.pay(
        payload.bookingId,
        payload.phone,
      );
      return IResponse.success('Booking created successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CHAPA_CALL_BACK)
  async chapaCallBack(@Payload() payload: any) {
    try {
      const res = await this.usecases.chapaCallBack(payload);
      return IResponse.success('Booking created successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BOOKING_CREATE_GUEST)
  async createBookingGUEST(
    @Payload() payload: { body: CreateBookingDto; user: any },
  ) {
    try {
      const res = await this.usecases.createBooking(
        payload.body,
        payload?.user?.sub,
      );
      return IResponse.success('Booking created successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('BOOKING', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.BOOKING_UPDATE)
  async updateBooking(@Payload() payload: { id: string; data: any }) {
    try {
      const res = await this.usecases.updateBooking(payload.id, payload.data);
      return IResponse.success('Booking updated successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('BOOKING', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.BOOKING_DELETE)
  async deleteBooking(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.deleteBooking(payload.id);
      return IResponse.success('Booking deleted successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BOOKING_GET_BY_ID)
  async getBookingById(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.getBookingById(payload.id);
      return IResponse.success('Booking fetched successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BOOKING_GET_BY_CODE)
  async getBookingByCode(@Payload() payload: { code: string }) {
    try {
      const res = await this.usecases.getBookingByCode(payload.code);
      return IResponse.success('Booking fetched successfully', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_GET_ALL_MY)
  async getMyBookings(data: { query: ListQueryDto; user: any }) {
    try {
      const result = await this.usecases.getMyBookings(
        data.query,
        data.user?.sub,
      );
      return IResponse.success(
        'Bookings fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_GET_ALL)
  async getAllBookings(data: { query: ListQueryDto; user: any }) {
    try {
      const result = await this.usecases.getMyBookings(
        data.query,
        data.user?.sub,
      );
      return IResponse.success(
        'Bookings fetched successfully',
        result.models,
        result.pagination,
      );
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

  @UseGuards(PermissionGuard)
  @CheckPermission('BOOKING', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.BOOKING_CANCEL_BY_ADMIN)
  async cancelByAdmin(
    @Payload() payload: { id: string; dto: BookingChangeStatusDto },
  ) {
    try {
      const res = await this.usecases.cancelByAdmin(
        payload.id,
        'payload.dto',
        123,
      );
      return IResponse.success('Booking cancelled by admin', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  // ....................................... inception .......................................
  @MessagePattern(PATTERNS.BOOKING_INSPECTION_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const inspection = await this.usecases.getInspection(payload.id);
      return IResponse.success('Inspection fetched successfully', inspection);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_INSPECTION_FIND_ALL)
  async findAll(data: { query: ListQueryDto }) {
    try {
      console.log('inseptionsss');
      const result = await this.usecases.getAllInspections(data.query);
      return IResponse.success(
        'Inspections fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_INSPECTION_CREATE)
  async create(@Payload() payload: { data: BookingInspectionDto; user: any }) {
    try {
      const inspection = await this.usecases.createInspection(
        payload.data,
        payload.user.sub,
      );
      return IResponse.success('Inspection created successfully', inspection);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_INSPECTION_UPDATE)
  async updatedInspection(
    @Payload()
    payload: {
      data: BookingInspectionUpdateDto;
      user: any;
      id: string;
    },
  ) {
    try {
      const inspection = await this.usecases.updateInspection(
        payload.data,
        payload.user.sub,
        payload.id,
      );
      return IResponse.success('Inspection Updated successfully', inspection);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.BOOKING_INSPECTION_APPROVE)
  async approve(@Payload() payload: { id: string }) {
    try {
      const inspection = await this.usecases.approveInspection(payload.id);
      return IResponse.success('Inspection approved successfully', inspection);
    } catch (error) {
      handleCatch(error);
    }
  }
}
