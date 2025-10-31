import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(AuthGuard('jwt')) // ¡Toda esta sección está protegida!
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req) {
    const userId = req.user.id; // Obtenemos el ID del usuario desde el token
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get('my-bookings')
  findMyBookings(@Req() req) {
    const userId = req.user.id;
    return this.bookingsService.findMyBookings(userId);
  }

  @Delete(':id/cancel')
  cancelBooking(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.bookingsService.cancelBooking(id, userId);
  }
}