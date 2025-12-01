

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Availability } from './availability.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  availabilityId: number;

  
  @Column({ type: 'int' })
  medecinId: number;

  @Column({ type: 'date' })
  date: string;

  
  @Column({ type: 'time' })
  startTime: string; 

  @Column({ type: 'time' })
  endTime: string; 

  @Column({
    type: 'enum',
    enum: ['disponible', 'occupé'],
    default: 'disponible',
  })
  status: 'disponible' | 'occupé';

  @Column({ type: 'int', nullable: true })
  patientId?: number;

  @Column({ type: 'int', nullable: true })
  appointmentId?: number;

  
  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availabilityId' })
  availability: Availability;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'medecinId' })
  medecin: User;

  @ManyToOne(() => User, { nullable: true, eager: true }) 
  @JoinColumn({ name: 'patientId' })
  patient?: User;

  

  
  @ManyToOne(() => Appointment, (appointment) => appointment.timeSlot, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment?: Appointment;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}