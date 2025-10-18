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
import { CancellationPolicyMessageController } from './cancellation-policy/cancellation-policy.controller';
import { CancellationPolicyUseCasesImp } from './cancellation-policy/cancellation-policy.usecase.impl';
import { CancellationPolicyRepository } from './cancellation-policy/cancellation-policy.repository';
import { CarRepository } from '../operations/car/car.repository';
import { MessageMessageController } from './message/message.controller';
import { MessageUseCasesImp } from './message/message.usecase.impl';
import { MessageRepository } from './message/message.repository';
import { NotifyHubModule } from '../notify-hub/notify-hub.module';
import { redisProvider } from '../notify-hub/redis/redis.provider';

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
    CancellationPolicyMessageController,
    MessageMessageController,
  ],

  providers: [
    CarRepository,
    PrismaService,
    BookingUseCasesImp,
    BookingRepository,
    ReviewUseCasesImpl,
    ReviewRepository,
    DisputeUseCasesImpl,
    DisputeRepository,
    CancellationPolicyUseCasesImp,
    CancellationPolicyRepository,
    MessageUseCasesImp,
    MessageRepository,
    redisProvider,
  ],
  exports: [
    BookingUseCasesImp,
    ReviewUseCasesImpl,
    DisputeUseCasesImpl,
    CancellationPolicyUseCasesImp,
    MessageUseCasesImp,
    redisProvider,
  ],
})
export class RentalServiceModule {}
