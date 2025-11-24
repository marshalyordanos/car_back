import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { JwtAuthGuard } from '../common/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AllExceptions } from '../common/error';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_HOST ?? '0.0.0.0',
        port: Number(process.env.AUTH_PORT ?? 4001),
      },
    },
  );
  //

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalFilters(new AllExceptions());

  await app.listen();
  console.log(
    'Auth microservice running on TCP port',
    process.env.AUTH_PORT ?? 4001,
  );
}
bootstrap();
