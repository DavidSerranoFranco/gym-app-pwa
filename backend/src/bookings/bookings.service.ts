import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from '../schedules/schemas/schedule.schema';
import { UserMembership } from '../user-memberships/schemas/user-membership.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
// Importamos el Enum 'BookingStatus' desde el schema
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(UserMembership.name) private userMembershipModel: Model<UserMembership>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const { schedule: scheduleId, bookingDate } = createBookingDto;

    // --- Validación 1: Suscripción activa ---
    const activeSubscription = await this.userMembershipModel.findOne({
      user: userId,
      status: 'ACTIVE',
      endDate: { $gte: new Date(bookingDate) },
    });

    if (!activeSubscription) {
      throw new UnauthorizedException('No tienes una membresía activa válida para esta fecha.');
    }

    // --- Validación 2: Clases restantes ---
    if (activeSubscription.classesRemaining <= 0) {
      throw new BadRequestException('No te quedan clases disponibles en tu membresía.');
    }

    // --- Validación 3: Horario existente ---
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('El horario seleccionado no existe.');
    }

    // --- Validación 4: Cupo disponible ---
    const existingBookings = await this.bookingModel.countDocuments({
      schedule: scheduleId,
      bookingDate: bookingDate,
      // CORRECCIÓN: Usamos el Enum
      status: BookingStatus.CONFIRMED,
    });

    if (existingBookings >= schedule.capacity) {
      throw new ConflictException('Esta clase ya está llena. No hay cupo disponible.');
    }

    // --- Validación 5: Reserva duplicada ---
    const userAlreadyBooked = await this.bookingModel.findOne({
      user: userId,
      schedule: scheduleId,
      bookingDate: bookingDate,
      // CORRECCIÓN: Usamos el Enum
      status: BookingStatus.CONFIRMED,
    });

    if (userAlreadyBooked) {
      throw new ConflictException('Ya estás registrado en esta clase para esta fecha.');
    }

    // --- Éxito ---
    
    // 1. Creamos la reserva
    const newBooking = new this.bookingModel({
      user: userId,
      schedule: scheduleId,
      bookingDate: bookingDate,
      // CORRECCIÓN: Usamos el Enum
      status: BookingStatus.CONFIRMED,
    });
    
    // 2. Descontamos clase
    activeSubscription.classesRemaining -= 1;

    // 3. Guardamos
    await Promise.all([
      newBooking.save(),
      activeSubscription.save(),
    ]);

    return newBooking;
  }

  // Método para que un usuario vea sus propias reservas
  async findMyBookings(userId: string) {
    return this.bookingModel
      .find({ 
        user: userId,
        // CORRECCIÓN: Usamos el Enum
        status: BookingStatus.CONFIRMED 
      })
      .populate({
        path: 'schedule',
        populate: {
          path: 'location',
        },
      })
      .sort({ bookingDate: 'asc' })
      .exec();
  }

  // Método para que un usuario cancele una reserva
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      user: userId,
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada o no te pertenece.');
    }

    // CORRECCIÓN: Usamos el Enum
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Esta reserva ya estaba cancelada.');
    }

    // 1. CORRECCIÓN: Usamos el Enum para asignar el nuevo estado
    booking.status = BookingStatus.CANCELLED;

    // 2. Busca la suscripción activa del usuario para devolverle la clase
    const activeSubscription = await this.userMembershipModel.findOne({
      user: userId,
      status: 'ACTIVE',
    });

    if (activeSubscription) {
      activeSubscription.classesRemaining += 1;
      await activeSubscription.save();
    }
    
    await booking.save();
    return { message: 'Reserva cancelada exitosamente y clase devuelta.' };
  }
}