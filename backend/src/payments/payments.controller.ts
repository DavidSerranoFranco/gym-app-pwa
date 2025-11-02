import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CaptureOrderDto } from './dto/capture-order.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Endpoint para crear una orden en PayPal
   */
  @Post('create-order')
  @UseGuards(AuthGuard('jwt')) // <-- 1. Proteger la ruta
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req, // <-- 2. Obtener el 'request'
  ) {
    const userId = req.user.id; // <-- 3. Sacar el ID del usuario del token
    
    // --- CORRECCIÓN DE ERROR 1 ---
    // Ahora pasamos los 2 argumentos requeridos
    return this.paymentsService.createOrder(createOrderDto.membershipId, userId);
  }

  /**
   * Endpoint para capturar el pago
   */
  @Post('capture-order')
  @UseGuards(AuthGuard('jwt')) // <-- 1. Proteger la ruta
  captureOrder(
    @Body() captureOrderDto: CaptureOrderDto,
    @Req() req, // <-- 2. Obtener el 'request'
  ) {
    const userId = req.user.id; // <-- 3. Sacar el ID del usuario del token
    
    // --- CORRECCIÓN DE ERROR 2 ---
    // Ahora pasamos los 3 argumentos requeridos
    return this.paymentsService.captureOrder(
      captureOrderDto.orderID,
      captureOrderDto.membershipId, // <-- El argumento que faltaba
      userId,
    );
  }
}