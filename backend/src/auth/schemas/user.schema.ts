// backend/src/auth/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // timestamps añade createdAt y updatedAt automáticamente
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true }) // El email debe ser único
  email: string;

  @Prop({ required: true })
  password: string;

  // Aquí podrías añadir más campos en el futuro, como 'role', 'membership', etc.
}

export const UserSchema = SchemaFactory.createForClass(User);