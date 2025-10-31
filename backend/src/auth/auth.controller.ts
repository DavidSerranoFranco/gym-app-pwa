// backend/src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express'
import { imageFileFilter, multerStorageConfig } from './multer-config';
import 'multer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    const user = await this.authService.register(createAuthDto);
    // No devolver la contraseña en la respuesta
    const { password, ...result } = user.toObject();
    return result;
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  @Get('users')
  findAllClients() {
    return this.authService.findAllClients();
  }

  @Get('users/:id')
  // (Idealmente esto debería estar protegido solo para Admins)
  findClientProfile(@Param('id') id: string) {
    return this.authService.findClientProfile(id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt')) // Ruta protegida
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
  const userId = req.user.id; // Obtenemos el ID del token
  return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Patch('profile/picture')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { // 'file' debe coincidir con el nombre del campo en el frontend
    storage: multerStorageConfig, // Usamos nuestra configuración de guardado
    fileFilter: imageFileFilter, // Usamos nuestro filtro de imágenes
  }))
  uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;

    if (!file) {
      throw new BadRequestException('Archivo no válido o no proporcionado.');
    }

    // Creamos la URL pública del archivo
    // (Ej: http://localhost:5000/uploads/archivo-123.jpg)
    const fileUrl = `/uploads/${file.filename}`;
    
  // Llamamos al servicio para guardar esta URL en la base de datos
  return this.authService.updateProfilePicture(userId, fileUrl);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyProfile(@Req() req) {
    // Devuelve el perfil completo del usuario que hace la petición
    return this.authService.getMyProfile(req.user.id);
  }
}