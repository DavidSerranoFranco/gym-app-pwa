import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Gender } from '../schemas/user.schema'; // Importar el Enum

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido paterno no puede estar vacío.' })
  paternalLastName: string;

  @IsString()
  @IsOptional() // Apellido materno es opcional
  maternalLastName: string;

  @IsEmail({}, { message: 'Por favor, introduce un correo electrónico válido.' })
  email: string;

  @IsString()
  @Length(8, 32, { message: 'La contraseña debe tener entre 8 y 32 caracteres.' })
  password: string;

  @IsEnum(Gender, { message: 'Género no válido.' })
  gender: Gender;

  @IsString()
  @IsNotEmpty({ message: 'El estado no puede estar vacío.' })
  state: string;

  @IsNumber({}, { message: 'La edad debe ser un número.' })
  @Min(15, { message: 'Debes tener al menos 15 años.' })
  @Max(99, { message: 'Edad no válida.' })
  age: number;
}