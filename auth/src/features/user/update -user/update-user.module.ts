import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../../domain/user/user';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { UserUpdateController } from './update-user.controller';
import { UserUpdateHandler } from './update-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UserUpdateController],
  providers: [UserRepository, UserUpdateHandler],
  exports: [UserUpdateHandler],
})
export class UserUpdateModule { }
