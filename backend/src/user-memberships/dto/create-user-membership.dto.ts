import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserMembershipDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del usuario es requerido.' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID de la membresía es requerido.' })
  membershipId: string;
}