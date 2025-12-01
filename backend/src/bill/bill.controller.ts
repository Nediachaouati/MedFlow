import { Controller, Get, Param, Put, Request } from '@nestjs/common';
import { BillService } from './bill.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/role.enum';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(+id);
  }

  @Get('appointment/:appointmentId')
  getBillByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.billService.getBillByAppointment(+appointmentId);
  }

  @Roles(Role.RECEPTIONNISTE)
  @Put(':id/pay')
  async markAsPaid(@Param('id') id: string, @Request() req: any) {
    return this.billService.markAsPaid(+id);
  }
}
