import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bills, { eager: true })
  patient: User;

  @ManyToOne(() => Appointment, (appointment) => appointment.bill, { eager: true })
  appointment: Appointment;

  @Column()
  amount: number;
  
  totalAmount: number; 

  @Column({ default: 'UNPAID' })
  status: 'UNPAID' | 'PAID';

  @CreateDateColumn()
  createdAt: Date;
}
