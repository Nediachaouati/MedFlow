import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';


@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  medecinId: string; // ID du médecin comme chaîne

  @Column()
  day: string; // Ex. "Lundi"

  @Column()
  date: string; // Ex. "2025-10-27"

  @Column()
  startTime: string; // Ex. "09:00"

  @Column()
  endTime: string; // Ex. "17:00"

  @Column({
    type: 'enum',
    enum: ['disponible', 'occupé', 'annulé'],
    default: 'disponible',
  })
  status: 'disponible' | 'occupé' | 'annulé';

  @ManyToOne(() => User, user => user.availabilities, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecinId' })
  medecin: User;

  @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;
}