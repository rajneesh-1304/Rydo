import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../../domain/user/user';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { UserGetController } from './get-user.controller';
import { UserGetHandler } from './get-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UserGetController],
  providers: [UserRepository, UserGetHandler],
  exports: [UserGetHandler],
})
export class UserGetModule { }
