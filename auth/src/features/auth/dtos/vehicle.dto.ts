import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VehicleDto {
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  plate_number: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  license_number: string;

  @Type(() => Date)
  @IsDate()
  license_expiration_date: Date;

  @IsString()
  @IsNotEmpty()
  insurance_number: string;

  @Type(() => Date)
  @IsDate()
  insurance_expiration_date: Date;

  @IsOptional()
  @IsString()
  car_image?: string;
}
