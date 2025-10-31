import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  durationInDays: number;

  // --- NUEVO CAMPO ---
  @IsNumber()
  @IsPositive()
  classCount: number;
}