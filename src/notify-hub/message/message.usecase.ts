import { Booking, User } from '@prisma/client';
import {
  CreateBookingDto,
  UpdateBookingDto,
} from '../../rental-service/booking/booking.entity';

export interface BookingUseCases {
  createBooking(dto: CreateBookingDto): Promise<Booking | null>;
  updateBooking(id: string, dto: UpdateBookingDto): Promise<any>;
  deleteBooking(id: string): Promise<any>;
  getBookingById(id: string): Promise<any>;
  getAllBookings(skip?: number, take?: number): Promise<any>;
}
