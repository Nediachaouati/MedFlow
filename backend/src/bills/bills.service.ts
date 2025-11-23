import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepo: Repository<Bill>,
    @InjectRepository(BillItem)
    private billItemRepo: Repository<BillItem>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  // Create bill from appointment (does NOT modify appointment)
  async createFromAppointment(appointmentId: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'medecin'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Example: default consultation item. Make pricing dynamic later.
    const consultationPrice = 40.0;

    const item = this.billItemRepo.create({
      description: 'Consultation médicale',
      price: consultationPrice,
      quantity: 1,
    });

    const bill = this.billRepo.create({
      patient: appointment.patient,
      appointment: appointment,
      items: [item],
      totalAmount: consultationPrice,
      status: 'UNPAID',
    });

    return this.billRepo.save(bill);
  }

  findAll() {
    return this.billRepo.find({ relations: ['patient', 'appointment', 'items'] });
  }

  findByPatient(patientId: number) {
    return this.billRepo.find({
      where: { patient: { id: patientId } as any },
      relations: ['patient', 'appointment', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const bill = await this.billRepo.findOne({
      where: { id },
      relations: ['patient', 'appointment', 'items'],
    });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async pay(id: number, method: string) {
    const bill = await this.billRepo.findOne({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.status === 'PAID') throw new BadRequestException('Bill already paid');

    bill.status = 'PAID';
    bill.paymentMethod = method;
    bill.paidAt = new Date();

    return this.billRepo.save(bill);
  }
}
