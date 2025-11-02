import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckIn, CheckInSchema } from './schemas/check-in.schema';
import { AuthModule } from '../auth/auth.module';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Schedule, ScheduleSchema } from '../schedules/schemas/schedule.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckIn.name, schema: CheckInSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule, // Para la protección de rutas del admin
  ],
  controllers: [CheckInsController],
  providers: [CheckInsService],
})
export class CheckInsModule {}