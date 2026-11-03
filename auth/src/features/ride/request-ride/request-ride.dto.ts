import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestRideDto {
  @IsUUID()
  @IsNotEmpty()
  rider_id: string;

  @IsString()
  @IsNotEmpty()
  pickup_address: string;

  @IsNotEmpty()
  pickup_latitude: string;

  @IsNotEmpty()
  pickup_longitude: string;

  @IsString()
  @IsNotEmpty()
  dropoff_address: string;

  @IsNotEmpty()
  dropoff_latitude: string;

  @IsNotEmpty()
  dropoff_longitude: string;

  @IsNotEmpty()
  distance: string;

  @IsOptional()
  fare?: string;
}
