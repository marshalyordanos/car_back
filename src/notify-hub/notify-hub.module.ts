import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { NotifyHubGateway } from './notify-hub.gateway';
import { redisProvider } from './redis/redis.provider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  // controllers: [],
  providers: [PrismaService, NotifyHubGateway, redisProvider],
  exports: [NotifyHubGateway],
})
export class NotifyHubModule {}
