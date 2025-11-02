import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida.' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32, { message: 'La nueva contraseña debe tener entre 8 y 32 caracteres.' })
  newPassword: string;
}