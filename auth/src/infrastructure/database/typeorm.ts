import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSource, dataSourceOptions } from '../../../orm-config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        dataSourceOptions(configService),
      dataSourceFactory: () => Promise.resolve(dataSource()),
    }),
  ],
})
export class TypeORMModule {}
