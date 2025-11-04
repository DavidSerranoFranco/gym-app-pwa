import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

// --- 1. Definir el Sub-Schema GeoJSON para un "Punto" ---
// Esto le dice a MongoDB que este campo es geoespacial.
@Schema({ _id: false })
class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  // [Longitude, Latitude] - ¡Importante! Es en ese orden.
  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  address: string;
  
  // --- 2. Añadir los nuevos campos ---
  @Prop({ type: GeoPoint, index: '2dsphere', required: true })
  geo: GeoPoint;
}

export const LocationSchema = SchemaFactory.createForClass(Location);