import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(10, 255)
  address: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone: string;
}