import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    const bill = await this.billRepo
      .createQueryBuilder('bill')
      .where('bill.appointmentId = :appointmentId', { appointmentId })
      .getOne();

    if (!bill) {
      throw new NotFoundException('Bill not found for this appointment');
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

const speciality = appointment.medecin.speciality?.toUpperCase() || 'GENERALISTE';
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
}
