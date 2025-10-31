import { IsString, IsNotEmpty } from 'class-validator';

export class CaptureOrderDto {
  @IsString()
  @IsNotEmpty()
  orderID: string;
}