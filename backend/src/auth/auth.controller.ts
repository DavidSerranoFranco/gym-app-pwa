// backend/src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth') // Todas las rutas aquí empezarán con /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // La ruta completa será POST /auth/register
  async register(@Body() createAuthDto: CreateAuthDto) {
    const user = await this.authService.register(createAuthDto);
    // No devolver la contraseña en la respuesta
    const { password, ...result } = user.toObject();
    return result;
  }
}