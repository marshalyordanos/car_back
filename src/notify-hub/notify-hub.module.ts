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

// import { Module } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { ConfigModule } from '@nestjs/config';
// import { JwtModule } from '@nestjs/jwt';
// import { MessageMessageController } from './message/message.controller';
// import { MessageUseCasesImp } from './message/message.usecase.impl';
// import { MessageRepository } from './message/message.repository';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'yourSecret',
//       signOptions: { expiresIn: '15m' },
//     }),
//   ],
//   controllers: [MessageMessageController],
//   providers: [PrismaService, MessageUseCasesImp, MessageRepository],
//   exports: [MessageMessageController],
// })
// export class NotifyHubModule {}
