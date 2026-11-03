import { Module } from '@nestjs/common';
import { DriverSaveModule } from './register-driver/register-driver.module';
import { DriverGetModule } from './get-driver/get-driver.module';
import { DriverUpdateModule } from './update/update.module';

@Module({
  imports: [
    DriverSaveModule,
    DriverGetModule,
    DriverUpdateModule,
  ],
  exports: [
    DriverSaveModule,
    DriverGetModule,
    DriverUpdateModule,
  ],
})
export class DriverFeatureModule {}
