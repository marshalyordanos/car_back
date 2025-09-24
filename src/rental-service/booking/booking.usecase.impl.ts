// booking.usecase.impl.ts
import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import {
  BookingChangeStatusDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './booking.entity';
import { BookingUseCases } from './booking.usecase';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingUseCasesImp implements BookingUseCases {
  constructor(private readonly repo: BookingRepository) {}

  async createBooking(dto: CreateBookingDto) {
    return this.repo.createBooking(dto);
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

  cancelByGuest(id: string) {
    return this.repo.changeStatus(id, BookingStatus.CANCELLED_BY_GUEST);
  }

  confirmByHost(id: string) {
    return this.repo.changeStatus(id, BookingStatus.CONFIRMED);
  }

  rejectByHost(id: string) {
    return this.repo.changeStatus(id, BookingStatus.REJECTED);
  }

  cancelByHost(id: string) {
    return this.repo.changeStatus(id, BookingStatus.CANCELLED_BY_HOST);
  }

  completeByHost(id: string) {
    return this.repo.changeStatus(id, BookingStatus.COMPLETED);
  }

  cancelByAdmin(id: string, dto: BookingChangeStatusDto) {
    console.log('------------------:', dto);
    return this.repo.changeStatus(id, dto.status);
  }
}
