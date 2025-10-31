// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Importa el ValidationPipe
import * as express from 'express'; // <-- 2. Importar express
import { join } from 'path'; // <-- 3. Importar join

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // --- 2. AÑADE ESTA LÍNEA AQUÍ ---
  // Esto activa la validación para todas las peticiones que lleguen a la API
  app.useGlobalPipes(new ValidationPipe());

  // Configura la app para servir archivos estáticos desde la carpeta 'uploads'
  // Esto permitirá acceder a las fotos de perfil desde el frontend
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(3000);
}
bootstrap();