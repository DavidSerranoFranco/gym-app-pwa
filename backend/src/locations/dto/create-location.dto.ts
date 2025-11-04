import { IsString, IsNotEmpty, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;
  
  // --- Campos añadidos ---
  // Usamos validadores geoespaciales
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}