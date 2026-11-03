import {
  BeforeInsert,
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

  @Column({ type: 'varchar', length: 64, unique: true })
  uuid: string;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = `v-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    }
  }

  @Column()
  model: string;

  @Column({ default: 'Sedan' })
  cab_type: string;

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
