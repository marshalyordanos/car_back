import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BookingMessageController } from './booking/booking.controller';
import { BookingUseCasesImp } from './booking/booking.usecase.impl';
import { BookingRepository } from './booking/booking.repository';
import { ReviewUseCasesImpl } from './review/review.usecase.impl';
import { ReviewRepository } from './review/review.repository';
import { ReviewMessageController } from './review/review.controller';
import { DisputeMessageController } from './dispute/dispute.controller';
import { DisputeUseCasesImpl } from './dispute/dispute.usecase.impl';
import { DisputeRepository } from './dispute/dispute.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    BookingMessageController,
    BookingMessageController,
    ReviewMessageController,
    DisputeMessageController,
  ],
  providers: [
    PrismaService,
    BookingUseCasesImp,
    BookingRepository,
    ReviewUseCasesImpl,
    ReviewRepository,
    DisputeUseCasesImpl,
    DisputeRepository,
  ],
  exports: [BookingUseCasesImp, ReviewUseCasesImpl, DisputeUseCasesImpl],
})
export class RentalServiceModule {}
