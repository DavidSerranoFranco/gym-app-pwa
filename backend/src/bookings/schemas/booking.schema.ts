// backend/src/bookings/schemas/booking.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Schedule } from '../../schedules/schemas/schedule.schema';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking {
  // Referencia al bloque de horario que se está reservando
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true })
  schedule: Schedule;

  // Referencia al usuario que realiza la reserva
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  // La fecha específica de la clase (ej. "2025-10-25")
  // Esto es crucial porque el horario solo nos dice el día de la semana, no la fecha.
  @Prop({ required: true })
  bookingDate: string;

  @Prop({ type: String, required: true, enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);