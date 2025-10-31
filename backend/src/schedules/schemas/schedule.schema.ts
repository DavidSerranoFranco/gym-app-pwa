// backend/src/schedules/schemas/schedule.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Location } from '../../locations/schemas/location.schema'; // <-- Importa el schema de Location

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({ timestamps: true })
export class Schedule {
  // ... (dayOfWeek, startTime, endTime, capacity no cambian)
  @Prop({ required: true, enum: [1, 2, 3, 4, 5, 6, 7] })
  dayOfWeek: number;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  // --- NUEVO CAMPO ---
  // Guardamos una referencia al ID de la sucursal a la que pertenece este horario.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true })
  location: Location;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);