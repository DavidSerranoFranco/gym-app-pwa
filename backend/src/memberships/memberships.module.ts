import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { Membership, MembershipSchema } from './schemas/membership.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema }
    ])
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MongooseModule], // Exportar MongooseModule para que otros módulos puedan usarlo
})
export class MembershipsModule {}