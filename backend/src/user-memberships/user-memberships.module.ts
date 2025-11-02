import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMembershipsService } from './user-memberships.service';
import { UserMembershipsController } from './user-memberships.controller';
import { UserMembership, UserMembershipSchema } from './schemas/user-membership.schema';

// --- 1. IMPORTAR LOS MODELOS FALTANTES ---
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Membership, MembershipSchema } from '../memberships/schemas/membership.schema';

@Module({
  imports: [
    // --- 2. REGISTRAR LOS TRES MODELOS ---
    // El servicio 'UserMembershipsService' usa estos tres modelos,
    // por lo tanto, deben estar registrados aquí.
    MongooseModule.forFeature([
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: User.name, schema: UserSchema }, // <-- Esta línea faltaba
      { name: Membership.name, schema: MembershipSchema }, // <-- Esta línea faltaba
    ]),
  ],
  controllers: [UserMembershipsController],
  providers: [UserMembershipsService],
})
export class UserMembershipsModule {}