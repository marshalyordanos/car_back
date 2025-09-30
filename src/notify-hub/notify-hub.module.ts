import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ReviewUseCasesImpl } from './message/message.usecase.impl';
import { ReviewRepository } from './message/message.repository';
import { ReviewMessageController } from './message/message.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [ReviewMessageController],
  providers: [PrismaService, ReviewUseCasesImpl, ReviewRepository],
  exports: [ReviewUseCasesImpl],
})
export class NotifyHubModule {}
