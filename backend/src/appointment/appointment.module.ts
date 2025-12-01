import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { TimeSlot } from '../availability/entities/time-slot.entity';
import { User } from '../users/entities/user.entity';
import { BillService } from '../bill/bill.service'; 
import { Bill } from '../bill/entities/bill.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, TimeSlot, User, Bill]), 
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, BillService], 
  exports: [AppointmentService],
})
export class AppointmentModule {}