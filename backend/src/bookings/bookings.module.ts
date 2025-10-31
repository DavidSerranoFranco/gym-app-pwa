import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { AuthModule } from '../auth/auth.module';
import { UserMembership, UserMembershipSchema } from '../user-memberships/schemas/user-membership.schema';
import { Schedule, ScheduleSchema } from '../schedules/schemas/schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    AuthModule, // Para proteger las rutas
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}