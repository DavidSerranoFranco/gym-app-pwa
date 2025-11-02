import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Correo electrónico no válido.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos.' })
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32, { message: 'La contraseña debe tener entre 8 y 32 caracteres.' })
  newPassword: string;
}