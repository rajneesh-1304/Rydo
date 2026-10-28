import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeORMModule } from './infrastructure/database/typeorm';
import { AuthFeatureModule } from './features/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeORMModule,
    AuthFeatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
