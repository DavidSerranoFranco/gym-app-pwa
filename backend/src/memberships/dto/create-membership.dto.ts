import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
  
  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsNumber()
  @Min(0)
  classesPerWeek: number;

  @IsNumber()
  @Min(0)
  totalClasses: number;
  
  @IsNumber()
  @Min(0)
  points: number;
}