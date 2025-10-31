import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from '../bookings/schemas/booking.schema';
import { Schedule } from '../schedules/schemas/schedule.schema';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { CheckIn, CheckInDocument, CheckInStatus } from './schemas/check-in.schema';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckInDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  /**
   * Maneja el escaneo de un QR.
   * Decide si es un check-in (entrada) o un check-out (salida).
   */
  async handleScan(createCheckInDto: CreateCheckInDto) {
    const { userId } = createCheckInDto;

    // 1. Buscamos si el usuario ya tiene un check-in activo (está adentro)
    const activeCheckIn = await this.checkInModel.findOne({
      user: userId,
      status: CheckInStatus.CHECKED_IN,
    });

    if (activeCheckIn) {
      // --- Lógica de CHECK-OUT (Salida) ---
      return this.performCheckOut(activeCheckIn);
    } else {
      // --- Lógica de CHECK-IN (Entrada) ---
      return this.performCheckIn(userId);
    }
  }

  /**
   * Valida y registra una nueva entrada (CHECK-IN)
   */
  private async performCheckIn(userId: string) {
    // 1. Validar que el usuario tenga una reserva confirmada para hoy
    const todayString = new Date().toISOString().split('T')[0];
    
    const validBooking = await this.findValidBookingForToday(userId, todayString);

    if (!validBooking) {
      throw new BadRequestException('El usuario no tiene una reserva activa para hoy o la clase ya terminó.');
    }

    // 2. Creamos el nuevo registro de check-in
    const newCheckIn = new this.checkInModel({
      user: userId,
      booking: validBooking._id,
      location: validBooking.schedule.location, // Asumimos que schedule está poblado
      checkInTime: new Date(),
      status: CheckInStatus.CHECKED_IN,
    });

    await newCheckIn.save();
    return {
      message: 'Entrada registrada con éxito.',
      type: 'CHECK_IN',
      checkIn: newCheckIn,
    };
  }

  /**
   * Busca una reserva válida para el usuario en el día actual y hora actual.
   */
  private async findValidBookingForToday(userId: string, todayString: string) {
    const now = new Date();

    const todayBookings = await this.bookingModel
      .find({
        user: userId,
        bookingDate: todayString,
        status: BookingStatus.CONFIRMED,
      })
      .populate({
        path: 'schedule',
        populate: { path: 'location' }, // Populamos la ubicación dentro del horario
      })
      .exec();

    if (todayBookings.length === 0) return null;

    // Buscamos una reserva que esté en la ventana de tiempo correcta
    const validBooking = todayBookings.find(booking => {
      // Hacemos 'casting' porque 'schedule' está poblado
      const schedule = booking.schedule as unknown as Schedule;
      if (!schedule) return false;

      // Convertimos las horas "HH:MM" a objetos Date de hoy
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const classStartTime = new Date(todayString);
      classStartTime.setHours(startHour, startMin, 0, 0);
      
      const classEndTime = new Date(todayString);
      classEndTime.setHours(endHour, endMin, 0, 0);

      // Permitimos check-in 30 minutos antes de que empiece la clase
      const checkInWindowStart = new Date(classStartTime.getTime() - 30 * 60000);

      // El usuario puede hacer check-in si está en la ventana y la clase no ha terminado
      return now >= checkInWindowStart && now <= classEndTime;
    });

    return validBooking;
  }

  /**
   * Registra una salida (CHECK-OUT)
   */
  private async performCheckOut(activeCheckIn: CheckInDocument) {
    activeCheckIn.status = CheckInStatus.CHECKED_OUT;
    activeCheckIn.checkOutTime = new Date();
    await activeCheckIn.save();

    return {
      message: 'Salida registrada con éxito.',
      type: 'CHECK_OUT',
      checkIn: activeCheckIn,
    };
  }

  /**
   * Devuelve todo el historial de check-ins (para el admin)
   */
  async findAll() {
    return this.checkInModel
      .find()
      .populate('user', 'name email') // Solo trae nombre y email del usuario
      .populate('location', 'name') // Solo trae el nombre de la sucursal
      .populate({
        path: 'booking',
        populate: {
          path: 'schedule',
          select: 'startTime endTime' // Solo trae las horas del horario
        }
      })
      .sort({ checkInTime: -1 }) // Los más recientes primero
      .exec();
  }
}