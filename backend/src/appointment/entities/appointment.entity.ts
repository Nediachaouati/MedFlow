import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TimeSlot } from 'src/availability/entities/time-slot.entity';

export enum AppointmentStatus {
  PENDING = 'en_attente',
  CONFIRMED = 'confirmé',
  CANCELLED = 'annulé',
  COMPLETED = 'terminé',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  medecinId: number;

  @Column()
  patientId: number;

  @Column()
  timeSlotId: number;        

  @Column({ type: 'date', nullable: true })  
  date: string;
  
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medecinId' })
  medecin: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @ManyToOne(() => TimeSlot, { eager: true })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlot;

  @Column({ type: 'text', nullable: true })
  diagnostic?: string;

  @Column({ type: 'text', nullable: true })
  medicaments?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}