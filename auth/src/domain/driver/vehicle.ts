import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column()
  model: string;

  @Column({ unique: true })
  plate_number: string;

  @Column()
  color: string;

  @Column({ unique: true })
  license_number: string;

  @Column({ type: 'date' })
  license_expiration_date: Date;

  @Column({ unique: true })
  insurance_number: string;

  @Column({ type: 'date' })
  insurance_expiration_date: Date;

  @Column({ nullable: true })
  car_image?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Driver, (driver) => driver.vehicle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}
