import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateCheckInDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}