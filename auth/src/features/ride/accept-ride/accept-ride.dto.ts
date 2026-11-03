import { IsNotEmpty, IsUUID } from 'class-validator';

export class AcceptRideDto {
  @IsUUID()
  @IsNotEmpty()
  driver_id: string;
}
