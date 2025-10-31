import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Membership } from '../../memberships/schemas/membership.schema';

export type UserMembershipDocument = HydratedDocument<UserMembership>;

export enum UserMembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
}

@Schema({ timestamps: true })
export class UserMembership {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true })
  membership: Membership;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  classesRemaining: number;

  @Prop({
    type: String,
    required: true,
    enum: UserMembershipStatus,
    default: UserMembershipStatus.ACTIVE,
  })
  status: UserMembershipStatus;
}

export const UserMembershipSchema = SchemaFactory.createForClass(UserMembership);