import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter, multerStorageConfig } from './multer-config';
import 'multer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- ENDPOINTS DE GOOGLE OAUTH ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Activa la redirección a Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const googleUser = req.user;
    
    const user = await this.authService.validateGoogleUser(googleUser);

    // --- CORRECCIÓN DE ERROR 1 ---
    // 'user.name' se cambia por 'user.firstName'
    const payload = { id: user._id, name: user.firstName, role: user.role };
    const accessToken = this.authService.jwtService.sign(payload);

    const redirectUrl = `http://localhost:5173/auth/callback?token=${accessToken}`;
    res.redirect(redirectUrl);
  }

  // --- ENDPOINTS EXISTENTES ---
  
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    // --- CORRECCIÓN DE ERROR 2 ---
    // El servicio ahora se encarga de quitar la contraseña.
    // Simplemente devolvemos lo que el servicio nos da.
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Falta el token de verificación.');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // --- Rutas Protegidas ---

  @Get('users')
  findAllClients() {
    return this.authService.findAllClients();
  }

  @Get('users/:id')
  findClientProfile(@Param('id') id: string) {
    return this.authService.findClientProfile(id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyProfile(@Req() req) {
    return this.authService.getMyProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Patch('profile/picture')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: multerStorageConfig,
    fileFilter: imageFileFilter,
  }))
  uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;

    if (!file) {
      throw new BadRequestException('Archivo no válido o no proporcionado.');
    }

    const fileUrl = `/uploads/${file.filename}`;
    
    return this.authService.updateProfilePicture(userId, fileUrl);
  }

  @Patch('profile/change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }
}