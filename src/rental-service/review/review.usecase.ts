import { IPagination } from 'src/common/types';
import { CreateBookingDto, UpdateBookingDto } from './review.entity';
import { Booking, User } from '@prisma/client';

export interface BookingUseCases {
  createBooking(dto: CreateBookingDto): Promise<Booking | null>;
  updateBooking(id: string, dto: UpdateBookingDto): Promise<any>;
  deleteBooking(id: string): Promise<any>;
  getBookingById(id: string): Promise<any>;
  getAllBookings(skip?: number, take?: number): Promise<any>;
}
