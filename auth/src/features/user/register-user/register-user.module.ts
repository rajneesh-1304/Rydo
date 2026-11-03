import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../../domain/user/user';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { UserSaveController } from './register-user.controller';
import { UserSaveHandler } from './register-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UserSaveController],
  providers: [UserRepository, UserSaveHandler],
  exports: [UserSaveHandler],
})
export class UserSaveModule { }
