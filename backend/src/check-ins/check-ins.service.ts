import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from '../bookings/schemas/booking.schema';
import { Schedule } from '../schedules/schemas/schedule.schema';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { CheckIn, CheckInDocument, CheckInStatus } from './schemas/check-in.schema';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckInDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Maneja el escaneo de un QR.
   * Decide si es un check-in (entrada) o un check-out (salida).
   */
  async handleScan(createCheckInDto: CreateCheckInDto) {
    const { userId } = createCheckInDto;

    const activeCheckIn = await this.checkInModel.findOne({
      user: userId,
      status: CheckInStatus.CHECKED_IN,
    });

    if (activeCheckIn) {
      return this.performCheckOut(activeCheckIn);
    } else {
      return this.performCheckIn(userId);
    }
  }

  /**
   * Valida y registra una nueva entrada (CHECK-IN)
   * ESTA FUNCIÓN HA SIDO CORREGIDA
   */
  private async performCheckIn(userId: string) {
    // 1. Validar que el usuario tenga una reserva confirmada para hoy
    const todayString = new Date().toISOString().split('T')[0];
    
    const validBooking = await this.findValidBookingForToday(userId, todayString);

    if (!validBooking) {
      throw new BadRequestException('El usuario no tiene una reserva activa para hoy o la clase ya terminó.');
    }

    // 2. Creamos el nuevo registro de check-in (sin guardarlo aún)
    const newCheckIn = new this.checkInModel({
      user: userId,
      booking: validBooking._id,
      location: validBooking.schedule.location, // Asumimos que schedule está poblado
      checkInTime: new Date(),
      status: CheckInStatus.CHECKED_IN,
    });

    // 3. Preparamos la lógica de puntos
    const pointsForAttendance = 10;
    const updateUserPoints = this.userModel.findByIdAndUpdate(userId, {
      $inc: { points: pointsForAttendance },
    });
    
    // 4. Guardamos ambas operaciones (el check-in y los puntos) en paralelo
    await Promise.all([
      newCheckIn.save(),
      updateUserPoints
    ]);

    // 5. Devolvemos el mensaje de éxito (solo un return)
    return {
      message: `Entrada registrada. ¡Has ganado ${pointsForAttendance} puntos!`,
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
        populate: { path: 'location' },
      })
      .exec();

    if (todayBookings.length === 0) return null;

    const validBooking = todayBookings.find(booking => {
      const schedule = booking.schedule as unknown as Schedule;
      if (!schedule) return false;

      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const classStartTime = new Date(todayString);
      classStartTime.setHours(startHour, startMin, 0, 0);
      
      const classEndTime = new Date(todayString);
      classEndTime.setHours(endHour, endMin, 0, 0);

      const checkInWindowStart = new Date(classStartTime.getTime() - 30 * 60000);

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
      .populate('user', 'name email')
      .populate('location', 'name')
      .populate({
        path: 'booking',
        populate: {
          path: 'schedule',
          select: 'startTime endTime'
        }
      })
      .sort({ checkInTime: -1 })
      .exec();
  }
}