import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CaptureOrderDto } from './dto/capture-order.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.paymentsService.createOrder(createOrderDto.membershipId);
  }

  @Post('capture-order')
  @UseGuards(AuthGuard('jwt')) // <-- RUTA PROTEGIDA
  captureOrder(@Body() captureOrderDto: CaptureOrderDto, @Req() req) {
    const userId = req.user.id; // Obtenemos el ID del usuario desde el token
    return this.paymentsService.captureOrder(captureOrderDto.orderID, userId);
  }
}