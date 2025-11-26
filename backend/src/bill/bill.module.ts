import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill,Appointment])],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService], // ✅ export it so other modules can use it

})
export class BillModule {}
