import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RideStatus } from './ride-status.enum';
import { Driver } from '../driver/driver';
import { Users } from '../user/user';


@Entity('rides')
@Index(['rider_id'])
@Index(['driver_id'])
@Index(['status'])
export class Rides {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  uuid: string;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  @Column({ type: 'varchar', length: 36 })
  rider_id: string;

  @ManyToOne(() => Users, (user) => user.rides)
  @JoinColumn({ name: 'rider_id', referencedColumnName: 'uuid' })
  rider: Users;

  @Column({ type: 'varchar', length: 36, nullable: true })
  driver_id: string | null;

  @ManyToOne(() => Driver, (driver) => driver.rider, { nullable: true })
  @JoinColumn({ name: 'driver_id', referencedColumnName: 'uuid' })
  driver?: Driver | null;

  @Column({ type: 'varchar', length: 255 })
  pickup_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickup_latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickup_longitude: string;

  @Column({ type: 'varchar', length: 255 })
  dropoff_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoff_latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoff_longitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fare: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: RideStatus.REQUESTED,
  })
  status: RideStatus;

  @Column({ type: 'varchar', nullable: true })
  accepted_at: Date | string | null;

  @Column({ type: 'varchar', nullable: true })
  started_at: Date | string | null;

  @Column({ type: 'varchar', nullable: true })
  completed_at: Date | string | null;

  @Column({ type: 'varchar', nullable: true })
  cancelled_at: Date | string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}