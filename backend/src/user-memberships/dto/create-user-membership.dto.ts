import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateUserMembershipDto {
  @IsMongoId()
  @IsNotEmpty()
  user: string; // Recibiremos el ID del usuario

  @IsMongoId()
  @IsNotEmpty()
  membership: string; // Recibiremos el ID de la membresía
}