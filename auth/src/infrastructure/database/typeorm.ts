import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSource, dataSourceOptions } from '../../../orm-config';
import { DataSeedService } from './seeds/initial-data.seed';

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
  providers: [DataSeedService],
  exports: [DataSeedService],
})
export class TypeORMModule {}
