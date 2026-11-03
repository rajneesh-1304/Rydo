import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';
import { Users } from './src/domain/user/user';
import { Driver } from './src/domain/driver/driver';
import { Vehicle } from './src/domain/driver/vehicle';
import { Rides } from './src/domain/rides/rides.entity';
require('dotenv').config();

initializeTransactionalContext();

let dataSourceInstance: DataSource | null = null;

export const dataSourceOptions = (
  configService: ConfigService
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || process.env.DB_HOST || 'localhost',
  port: Number(configService.get<number>('DB_PORT') || process.env.DB_PORT || 5432),
  username: configService.get<string>('DB_USERNAME') || process.env.DB_USERNAME || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD || 'postgres',
  database: configService.get<string>('DB_NAME') || process.env.DB_NAME || 'taxii_auth',
  entities: [Users, Driver, Vehicle, Rides],
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  migrationsTableName: 'migrations',
  migrations: ['dist/src/infrastructure/database/migrations/*.js'],
});

export const dataSource = (() => {
  if (!dataSourceInstance) {
    dataSourceInstance = new DataSource(dataSourceOptions(new ConfigService()));
    return addTransactionalDataSource(dataSourceInstance);
  }
  return dataSourceInstance;
});

export default new DataSource(dataSourceOptions(new ConfigService()));