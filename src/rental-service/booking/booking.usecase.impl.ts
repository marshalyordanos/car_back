// booking.usecase.impl.ts
import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import {
  BookingChangeStatusDto,
  BookingInspectionDto,
  BookingInspectionUpdateDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './booking.entity';
import { BookingUseCases } from './booking.usecase';
import { BookingInspection, BookingStatus } from '@prisma/client';
import { CarRepository } from '../../operations/car/car.repository';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from 'src/common/query/query.dto';
import * as upload from '../../config/cloudinary/upload';

@Injectable()
export class BookingUseCasesImp {
  constructor(
    private readonly repo: BookingRepository,
    private readonly carRepo: CarRepository,
  ) {}

  async createBooking(dto: CreateBookingDto, userId?: string) {
    console.log('000000000:', dto, userId);
    // return;

    const car = await this.carRepo.findById(dto.carId);
    if (!car) {
      throw new RpcException('Car is not found!');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new RpcException('Invalid startDate or endDate');
    }

    if (start >= end) {
      throw new RpcException('startDate must be before endDate');
    }
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const baseTotal = car.rentalPricePerDay * days;

    const platformFee = baseTotal * 0.1;

    const tax = baseTotal * 0.15;

    const totalPrice = baseTotal + platformFee + tax;

    const uploadedFiles: any = {};

    if (!userId) {
      try {
        if (dto.driverLicenseFile) {
          uploadedFiles.driverLicenseId = await upload.uploadToCloudinary(
            dto.driverLicenseFile,
            'users/driverLicenses',
          );
        }
        if (dto.nationalIdFile) {
          uploadedFiles.nationalId = await upload.uploadToCloudinary(
            dto.nationalIdFile,
            'users/nationalIds',
          );
        }
      } catch (err) {
        throw new RpcException('Error uploading files to Cloudinary');
      }
    }

    return this.repo.createBooking(
      dto,
      totalPrice,
      platformFee,
      baseTotal,
      userId,
      uploadedFiles,
    );
  }

  async chapaCallBack(data: any) {
    return this.repo.handleChapaCallback(data);
  }

  async pay(bookingId: string, phone: string) {
    const booking = await this.repo.findBookingWithPayment(bookingId);
    if (!booking || !booking.payment) {
      throw new RpcException('Booking is not found!');
    }
    return this.repo.pay(phone, booking.payment);
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

  async getBookingByCode(code: string) {
    return this.repo.getBookingByCode(code);
  }

  async getMyBookings(query: ListQueryDto, userId: any) {
    const User = await this.repo.findUserById(userId);
    console.log('=========================================');
    if (!User) {
      throw new RpcException('User is not found!');
    }
    if (User.role?.name == 'GUEST') {
      if (/guestId:[^,]*/.test(query.filter || '')) {
        query.filter = query.filter?.replace(
          /guestId:[^,]*/,
          `guestId:${userId}`,
        );
      } else {
        query.filter = query.filter
          ? query.filter + `,guestId:${userId}`
          : `guestId:${userId}`;
      }
    } else if (User?.role?.name == 'HOST') {
      if (/hostId:[^,]*/.test(query.filter || '')) {
        query.filter = query.filter?.replace(
          /hostId:[^,]*/,
          `hostId:${userId}`,
        );
      } else {
        query.filter = query.filter
          ? query.filter + `,hostId:${userId}`
          : `hostId:${userId}`;
      }
    }
    const res = await this.repo.getMyBookings(query, userId);
    return {
      models: res.models,
      pagination: res.pagination,
    };
  }

  async getAllBookings(query: ListQueryDto) {
    console.log('=========================================1');

    const res = await this.repo.getAllBookings(query);
    return {
      models: res.models,
      pagination: res.pagination,
    };
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
    if (data.type === 'PICKUP') {
      const pickup = await this.repo.findInspectionByBookingAndType(
        data.bookingId,
        'PICKUP',
      );
      if (pickup) {
        throw new RpcException({
          statusCode: 404,
          message: 'Cannot create pickup already created.',
        });
      }
    }

    return this.repo.createInspection(data, userId);
  }

  async updateInspection(
    data: BookingInspectionUpdateDto,
    userId: string,
    id: string,
  ) {
    const ins = await this.repo.findById(id);

    if (!ins) {
      throw new RpcException({
        statusCode: 404,
        message: "can't find inspection",
      });
    }

    if (ins.approved) {
      throw new RpcException({
        statusCode: 404,
        message: "can't update inspection",
      });
    }

    if (ins.submittedById !== userId) {
      throw new RpcException({
        statusCode: 404,
        message: "can't update inspection",
      });
    }
    return this.repo.updateInspection(data, userId, id);
  }
  async getInspection(id: string): Promise<BookingInspection | null> {
    return this.repo.findById(id);
  }

  async getAllInspections(query: ListQueryDto) {
    const res = await this.repo.findAll(query);
    return {
      models: res.models,
      pagination: res.pagination,
    };
  }

  async approveInspection(id: string): Promise<BookingInspection> {
    // Get the inspection to approve
    console.log('approveInspection: ', id);
    const inspection = await this.repo.findById(id);
    if (!inspection) {
      throw new RpcException({
        statusCode: 404,
        message: 'Inspection not found',
      });
    }

    // Check if this is DROP OFF and already exists approved
    // if (inspection.type === 'DROPOFF') {
    //   const existingDropoff = await this.repo.findInspectionByBookingAndType(
    //     inspection.bookingId,
    //     'DROPOFF',
    //   );
    //   if (
    //     existingDropoff &&
    //     existingDropoff.approved &&
    //     existingDropoff.id !== id
    //   ) {
    //     throw new RpcException({
    //       statusCode: 400,
    //       message: 'Dropoff inspection already exists for this booking',
    //     });
    //   }
    // }
    if (inspection.approved) {
      throw new RpcException({
        statusCode: 400,
        message: 'Already approved!',
      });
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
