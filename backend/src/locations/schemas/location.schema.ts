// backend/src/locations/schemas/location.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true })
  name: string; // Ej. "Gym Centro", "Sucursal Sur"

  @Prop({ required: true })
  address: string; // Ej. "Av. Siempre Viva 123, Colonia Centro"

  // En el futuro, podríamos añadir coordenadas para el mapa:
  // @Prop()
  // latitude: number;

  // @Prop()
  // longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);