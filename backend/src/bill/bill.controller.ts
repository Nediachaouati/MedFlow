import { Controller, Get, Param, Request } from '@nestjs/common';
import { BillService } from './bill.service';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(+id);
  }

  // Get bill by appointmentId
  @Get('appointment/:appointmentId')
  getBillByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.billService.getBillByAppointment(+appointmentId);
  }
}
