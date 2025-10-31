// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Importa el ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // --- 2. AÑADE ESTA LÍNEA AQUÍ ---
  // Esto activa la validación para todas las peticiones que lleguen a la API
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();