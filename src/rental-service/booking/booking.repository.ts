// booking.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './booking.entity';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingRepository {
  constructor(private prisma: PrismaService) {}

  async createBooking(dto: CreateBookingDto) {
    const pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
    const dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;

    return this.prisma.booking.create({
      data: {
        carId: dto.carId,
        guestId: dto.guestId,
        hostId: dto.hostId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        totalPrice: dto.totalPrice,
        withDriver: dto.withDriver ?? false,
        pickupLocation,
        dropoffLocation,
      },
    });
  }

  async updateBooking(id: string, dto: UpdateBookingDto) {
    const data: any = { ...dto };

    if (dto.pickupLat && dto.pickupLng && dto.pickupName) {
      data.pickupLocation = `${dto.pickupLat}+*+${dto.pickupLng}+*+${dto.pickupName}`;
    }
    if (dto.dropoffLat && dto.dropoffLng && dto.dropoffName) {
      data.dropoffLocation = `${dto.dropoffLat}+*+${dto.dropoffLng}+*+${dto.dropoffName}`;
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        startDate: dto.startDate ?? undefined,
        endDate: dto.endDate ?? undefined,
        withDriver: dto.withDriver ?? undefined,
        pickupLocation: data.pickupLocation ?? undefined,
        dropoffLocation: data.dropoffLocation ?? undefined,
      },
    });
  }

  async deleteBooking(id: string) {
    return this.prisma.booking.delete({ where: { id } });
  }

  async getBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
        guest: true,
        host: true,
        payment: true,
        dispute: true,
      },
    });
  }

  async getAllBookings(skip = 0, take = 10) {
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take,
        include: {
          car: true,
          guest: true,
          host: true,
          payment: true,
          dispute: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count(),
    ]);
    return { bookings, total };
  }

  async changeStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}
