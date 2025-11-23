import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bill } from './bill.entity';

@Entity({ name: 'bill_items' })
export class BillItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bill, (bill) => bill.items, { onDelete: 'CASCADE' })
  bill: Bill;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
