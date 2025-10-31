// backend/src/schedules/dto/create-schedule.dto.ts

import { IsNotEmpty, IsInt, Min, Max, IsString, Matches, IsMongoId } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de inicio debe tener el formato HH:MM',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de fin debe tener el formato HH:MM',
  })
  endTime: string;

  @IsInt()
  @Min(1)
  capacity: number;

  // --- NUEVO CAMPO ---
  // Validamos que sea un ID válido de MongoDB
  @IsMongoId()
  @IsNotEmpty()
  location: string; // Recibiremos el ID de la sucursal como un string
}