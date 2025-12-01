import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private billRepo: Repository<Bill>,

    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async getBillByAppointment(appointmentId: number) {
    const bill = await this.billRepo.findOne({
      where: { appointment: { id: appointmentId } },
      relations: ['patient', 'appointment'],
    });

    if (!bill) {
      throw new NotFoundException('Facture non trouvée pour ce rendez-vous');
    }

    return bill;
  }

  async createFromAppointment(appointmentId: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'medecin'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Set price depending on doctor's speciality
    const specialityPrice: Record<string, number> = {
      GENERALISTE: 30,
      CARDIOLOGUE: 40,
      DERMATOLOGUE: 35,
      PEDIATRE: 25,
    };

    const speciality =
      appointment.medecin.speciality?.toUpperCase() || 'GENERALISTE';
    const price = specialityPrice[speciality] ?? 30;

    const bill = this.billRepo.create({
      patient: appointment.patient,
      appointment,
      amount: price,
      status: 'UNPAID',
    });

    return await this.billRepo.save(bill);
  }

  findByPatient(patientId: number) {
    return this.billRepo.find({
      where: { patient: { id: patientId } },
    });
  }

  findOne(id: number) {
    return this.billRepo.findOne({ where: { id } });
  }


async markAsPaid(billId: number) {
  const bill = await this.billRepo.findOne({ where: { id: billId } });
  if (!bill) throw new NotFoundException('Facture non trouvée');
  if (bill.status === 'PAID') return { message: 'Facture déjà payée' };

  bill.status = 'PAID';
  await this.billRepo.save(bill);

  return { message: 'Facture marquée comme payée avec succès', bill };
}
}
