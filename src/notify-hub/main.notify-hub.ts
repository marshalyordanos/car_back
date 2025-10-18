import { NestFactory, Reflector } from '@nestjs/core';
import { NotifyHubModule } from './notify-hub.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(NotifyHubModule); // ✅ create HTTP server
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: '*' });

  const port = Number(process.env.USER_PORT ?? 4004);
  await app.listen(port);

  console.log('NotifyHub WebSocket & REST running on port', port);
}
bootstrap();
