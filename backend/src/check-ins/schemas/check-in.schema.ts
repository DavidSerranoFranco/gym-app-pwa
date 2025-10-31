import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Booking } from '../../bookings/schemas/booking.schema';
import { Location } from '../../locations/schemas/location.schema';

export type CheckInDocument = HydratedDocument<CheckIn>;

export enum CheckInStatus {
  CHECKED_IN = 'CHECKED_IN', // El usuario está adentro
  CHECKED_OUT = 'CHECKED_OUT', // El usuario ya se fue
}

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  // Se vincula a la reserva específica que está usando
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true })
  booking: Booking; 
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true })
  location: Location;

  @Prop({ required: true })
  checkInTime: Date;

  @Prop()
  checkOutTime: Date;

  @Prop({ type: String, required: true, enum: CheckInStatus, default: CheckInStatus.CHECKED_IN })
  status: CheckInStatus;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);