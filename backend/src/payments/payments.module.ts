import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Membership, MembershipSchema } from '../memberships/schemas/membership.schema';
import { UserMembershipsModule } from '../user-memberships/user-memberships.module';
import { UserMembershipsService } from '../user-memberships/user-memberships.service';
import { UserMembership, UserMembershipSchema } from '../user-memberships/schemas/user-membership.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule, // Para proteger rutas
    UserMembershipsModule, // Para poder usar su servicio
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, UserMembershipsService], // Añade UserMembershipsService
})
export class PaymentsModule {}