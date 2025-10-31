import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Define los roles que pueden existir en la aplicación
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  toObject(): { [x: string]: any; password: any; } {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, required: true, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ default: null })
  profilePictureUrl: string; // Guardará la URL de la foto

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);