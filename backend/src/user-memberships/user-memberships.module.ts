import { Module } from '@nestjs/common';
import { UserMembershipsService } from './user-memberships.service';
import { UserMembershipsController } from './user-memberships.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMembership, UserMembershipSchema } from './schemas/user-membership.schema';
import { MembershipsModule } from '../memberships/memberships.module'; // Importa MembershipsModule
import { Membership, MembershipSchema } from '../memberships/schemas/membership.schema'; // Importa el Schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: Membership.name, schema: MembershipSchema }, // Regístralo aquí
    ]),
    MembershipsModule, // Impórtalo para poder usar el servicio
  ],
  controllers: [UserMembershipsController],
  providers: [UserMembershipsService],
})
export class UserMembershipsModule {}