import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Define los roles que pueden existir en la aplicación
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string; // 'name' ahora es 'firstName'

  @Prop({ type: String, default: '' })
  paternalLastName: string; // Apellido Paterno

  @Prop({ type: String, default: '' })
  maternalLastName: string; // Apellido Materno

  @Prop({ required: true, unique: true })
  email: string;
  
  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ type: String, enum: Gender, default: null })
  gender: Gender | null;

  @Prop({ type: String, default: null })
  state: string | null;

  @Prop({ type: Number, default: null })
  age: number | null;
  
  // ... (campos existentes: profilePictureUrl, address, phone, points, googleId, tokens, etc.)
  @Prop({ type: String, default: null })
  profilePictureUrl: string | null;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ type: String, default: null, index: true })
  googleId: string | null;

  @Prop({ type: String, default: null })
  resetPasswordToken: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires: Date | null;

  @Prop({ type: String, default: null })
  emailVerificationToken: string | null;

  @Prop({ default: false })
  isEmailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);