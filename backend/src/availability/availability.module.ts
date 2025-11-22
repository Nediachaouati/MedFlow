import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Availability } from './entities/availability.entity';
import { TimeSlot } from './entities/time-slot.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Availability, TimeSlot])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}