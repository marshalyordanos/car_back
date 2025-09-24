import { Module } from '@nestjs/common';
import { AuthMessageController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthUseCaseImpl } from './auth.usecase.impl';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '1m' },
    }),
  ],
  controllers: [AuthMessageController],
  providers: [AuthRepository, AuthUseCaseImpl, PrismaService],
  exports: [AuthUseCaseImpl],
})
export class AuthModule {}
