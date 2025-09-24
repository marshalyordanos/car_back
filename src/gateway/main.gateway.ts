import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { AllExceptions } from '../common/error';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useGlobalFilters(new AllExceptions());

  // --- Swagger Setup ---
  const config = new DocumentBuilder()
    .setTitle('Gateway API')
    .setDescription('API Gateway exposing all microservices endpoints')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // ----------------------

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Gateway listening on port ${port}`);
}

bootstrap();
