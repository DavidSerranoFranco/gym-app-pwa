import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MembershipDocument = HydratedDocument<Membership>;

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  durationInDays: number;

  // --- NUEVO CAMPO ---
  @Prop({ required: true, min: 1 })
  classCount: number; // Número de clases que incluye el plan

  @Prop({ default: true })
  isActive: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);