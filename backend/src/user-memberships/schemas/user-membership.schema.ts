import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Membership } from '../../memberships/schemas/membership.schema';

export type UserMembershipDocument = UserMembership & Document;

// --- 1. DEFINIR EL SUB-DOCUMENTO DE PAGO ---
// Esto le da a Mongoose y TypeScript la estructura de los detalles del pago.
@Schema({ _id: false }) // _id: false para que no cree un ID separado para este objeto
class PaymentDetails {
  @Prop({ required: true })
  paypalOrderId: string;

  @Prop({ required: true })
  amount: string; // Se guarda como string por consistencia con PayPal

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string; // Ej. 'COMPLETED'
}
const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);


// --- 2. ESQUEMA PRINCIPAL ---
@Schema({ timestamps: true })
export class UserMembership {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  user: User; // Referencia al usuario

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Membership', required: true })
  membership: Membership; // Referencia a la membresía

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  classesRemaining: number;

  @Prop({ required: true, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' })
  status: string;

  // --- 3. AÑADIR LA PROPIEDAD FALTANTE ---
  @Prop({ type: PaymentDetailsSchema, default: null })
  paymentDetails: PaymentDetails | null;
}

export const UserMembershipSchema = SchemaFactory.createForClass(UserMembership);