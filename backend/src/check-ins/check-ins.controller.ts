import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../auth/schemas/user.schema';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';

@Controller('check-ins')
@UseGuards(AuthGuard('jwt')) // Toda esta sección está protegida
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  /**
   * Endpoint que el admin usará para escanear el QR.
   */
  @Post('scan')
  handleScan(@Body() createCheckInDto: CreateCheckInDto, @Req() req) {
    // Verificamos que quien escanea es un ADMIN
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden escanear.');
    }
    return this.checkInsService.handleScan(createCheckInDto);
  }

  /**
   * Endpoint para que el admin vea el historial de todas las entradas/salidas.
   */
  @Get('history')
  findAll(@Req() req) {
    // Verificamos que sea un ADMIN
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Acceso denegado.');
    }
    return this.checkInsService.findAll();
  }
}