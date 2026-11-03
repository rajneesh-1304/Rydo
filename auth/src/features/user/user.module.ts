import { Module } from '@nestjs/common';
import { UserSaveModule } from './register-user/register-user.module';
import { UserGetModule } from './get-user/get-user.module';
import { UserUpdateModule } from './update -user/update-user.module';

@Module({
  imports: [
    UserSaveModule,
    UserGetModule,
    UserUpdateModule,
  ],
  exports: [
    UserSaveModule,
    UserGetModule,
    UserUpdateModule,
  ],
})
export class UserFeatureModule {}
