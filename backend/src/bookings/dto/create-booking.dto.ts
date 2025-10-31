import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  schedule: string; // El ID del bloque de horario

  @IsString()
  @IsNotEmpty()
  bookingDate: string; // La fecha específica, ej: "2025-10-31"
}

// No es necesario un update-booking.dto.ts, ya que las reservas no se "actualizan",
// se "cancelan" (lo cual es un DELETE o un cambio de estado).