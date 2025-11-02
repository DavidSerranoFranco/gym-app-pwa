import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MembershipDocument = Membership & Document;

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  price: number;
  
  @Prop({ default: '' })
  description: string;

  // --- NUEVA ESTRUCTURA PERFECTA ---
  @Prop({ required: true })
  durationDays: number; // Ej. 30 (para 1 mes)

  @Prop({ required: true, default: 0 })
  classesPerWeek: number; // Ej. 3 (clases por semana)

  @Prop({ required: true, default: 0 })
  totalClasses: number; // Ej. 12 (total de clases en el plan)

  @Prop({ required: true, default: 0 })
  points: number; // Puntos que otorga esta membresía
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);