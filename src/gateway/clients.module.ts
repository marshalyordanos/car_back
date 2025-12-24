import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4001,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4002 },
      },
      {
        name: 'RENTAL_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4003 },
      },
      {
        name: 'Notify_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4004 },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroserviceClientsModule {}
