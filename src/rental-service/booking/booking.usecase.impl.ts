// booking.usecase.impl.ts
import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import {
  BookingChangeStatusDto,
  BookingInspectionDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './booking.entity';
import { BookingUseCases } from './booking.usecase';
import { BookingInspection, BookingStatus } from '@prisma/client';
import { CarRepository } from '../../operations/car/car.repository';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BookingUseCasesImp implements BookingUseCases {
  constructor(
    private readonly repo: BookingRepository,
    private readonly carRepo: CarRepository,
  ) {}

  async createBooking(dto: CreateBookingDto) {
    const car = await this.carRepo.findById(dto.carId);
    if (!car) {
      throw new RpcException('Car is not found!');
    }
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const baseTotal = car.rentalPricePerDay * days;

    const platformFee = baseTotal * 0.1;

    const tax = baseTotal * 0.15;

    const totalPrice = baseTotal + platformFee + tax;
    return this.repo.createBooking(dto, totalPrice, platformFee, baseTotal);
  }

  async updateBooking(id: string, dto: UpdateBookingDto) {
    return this.repo.updateBooking(id, dto);
  }

  async deleteBooking(id: string) {
    return this.repo.deleteBooking(id);
  }

  async getBookingById(id: string) {
    return this.repo.getBookingById(id);
  }

  async getAllBookings(skip?: number, take?: number) {
    return this.repo.getAllBookings(skip, take);
  }

  confirmByHost(id: string) {
    return this.repo.changeStatusToConfirm(id);
  }

  rejectByHost(id: string) {
    return this.repo.changeStatusToReject(id, BookingStatus.REJECTED);
  }

  // cancelByGuest(id: string) {
  //   return this.repo.changeStatus(id, BookingStatus.CANCELLED_BY_GUEST);
  // }

  // cancelByHost(id: string) {
  //   return this.repo.changeStatus(id, BookingStatus.CANCELLED_BY_HOST);
  // }

  // cancelByAdmin(id: string, dto: BookingChangeStatusDto) {
  //   console.log('------------------:', dto);
  //   return this.repo.changeStatus(id, dto.status);
  // }
  completeByHost(id: string) {
    return this.repo.changeStatus(id, BookingStatus.COMPLETED);
  }

  // ....................................... inception .......................................

  async createInspection(
    data: BookingInspectionDto,
    userId: string,
  ): Promise<BookingInspection> {
    if (data.type === 'DROPOFF') {
      const pickup = await this.repo.findInspectionByBookingAndType(
        data.bookingId,
        'PICKUP',
      );
      if (!pickup) {
        throw new RpcException({
          statusCode: 404,
          message:
            'Cannot create dropoff inspection: pickup inspection not found.',
        });
      }
      if (!pickup.approved) {
        throw new RpcException({
          statusCode: 400,
          message:
            'Cannot create dropoff inspection: pickup inspection not approved.',
        });
      }
    }

    return this.repo.createInspection(data, userId);
  }

  async getInspection(id: string): Promise<BookingInspection | null> {
    return this.repo.findById(id);
  }

  async getAllInspections(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [inspections, total] = await this.repo.findAll(skip, pageSize);
    return {
      inspections,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async approveInspection(id: string): Promise<BookingInspection> {
    // Get the inspection to approve
    const inspection = await this.repo.findById(id);
    if (!inspection) {
      throw new RpcException({
        statusCode: 404,
        message: 'Inspection not found',
      });
    }

    // Check if this is DROP OFF and already exists approved
    if (inspection.type === 'DROPOFF') {
      const existingDropoff = await this.repo.findInspectionByBookingAndType(
        inspection.bookingId,
        'DROPOFF',
      );
      if (
        existingDropoff &&
        existingDropoff.approved &&
        existingDropoff.id !== id
      ) {
        throw new RpcException({
          statusCode: 400,
          message: 'Dropoff inspection already exists for this booking',
        });
      }
    }

    // Transaction: approve inspection, complete booking, create payment, update host earnings
    const result = await this.repo.approveInspectionTransaction(
      inspection.id,
      inspection.bookingId,
    );

    return result;
  }

  // ********************************* canclation ************************************
  // ********************************             *********************************
  async cancelByGuest(bookingId: string) {
    const booking = await this.repo.findBookingWithPayment(bookingId);
    if (!booking)
      throw new RpcException({ statusCode: 404, message: 'Booking not found' });

    const daysBeforeStart = Math.ceil(
      (booking.startDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const policies = await this.repo.getCancellationPolicy('GUEST');
    const policy =
      policies.find((p) => daysBeforeStart >= p.daysBeforeTrip) ||
      policies[policies.length - 1];
    const refundPercent = policy?.refundPercent || 0;

    const refundAmount = booking.payment?.amount! * (refundPercent / 100) || 0;

    await this.repo.runTransaction(async (tx) => {
      await this.repo.changeStatus(bookingId, BookingStatus.CANCELLED_BY_GUEST);
      if (booking.payment) {
        await this.repo.updatePaymentStatus(booking.payment.id, 'REFUNDED');
        await this.repo.createPaymentTransaction({
          paymentId: booking.payment.id,
          type: 'REFUND',
          amount: refundAmount,
          status: 'COMPLETED',
        });
      }
    });

    return { message: 'Booking cancelled by guest', refundAmount };
  }

  async cancelByHost(
    bookingId: string,
    reason = 'Cancelled after confirmation',
  ) {
    const booking = await this.repo.findBookingWithPayment(bookingId);
    if (!booking)
      throw new RpcException({ statusCode: 404, message: 'Booking not found' });

    const penalty = booking.payment?.amount! * 0.1 || 0; // example: 10% penalty

    await this.repo.runTransaction(async (tx) => {
      await this.repo.changeStatus(bookingId, BookingStatus.CANCELLED_BY_HOST);
      if (booking.payment) {
        await this.repo.updatePaymentStatus(booking.payment.id, 'REFUNDED');
      }
      await this.repo.createHostPenalty({
        hostId: booking.hostId,
        bookingId,
        amount: penalty,
        reason,
      });
    });

    return { message: 'Booking cancelled by host', penalty };
  }

  async cancelByAdmin(
    bookingId: string,
    adminId: string,
    refundAmount?: number,
  ) {
    const booking = await this.repo.findBookingWithPayment(bookingId);
    if (!booking)
      throw new RpcException({ statusCode: 404, message: 'Booking not found' });

    const refund = refundAmount || booking.payment?.amount || 0;

    await this.repo.runTransaction(async (tx) => {
      await this.repo.changeStatus(bookingId, BookingStatus.CANCELLED_BY_ADMIN);
      if (booking.payment) {
        await this.repo.updatePaymentStatus(booking.payment.id, 'REFUNDED');
        await this.repo.createPaymentTransaction({
          paymentId: booking.payment.id,
          type: 'REFUND',
          amount: refund,
          status: 'COMPLETED',
        });
      }

      await this.repo.createAdminAction({
        adminId,
        targetType: 'Booking',
        targetId: bookingId,
        actionType: 'CANCELLED',
        notes: `Admin cancelled booking with refund ${refund}`,
      });
    });

    return { message: 'Booking cancelled by admin', refund };
  }
}
