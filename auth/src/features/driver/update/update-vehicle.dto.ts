import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  plate_number?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  license_expiration_date?: Date;

  @IsOptional()
  @IsString()
  insurance_number?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  insurance_expiration_date?: Date;

  @IsOptional()
  @IsString()
  car_image?: string;
}
