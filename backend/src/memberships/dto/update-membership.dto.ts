// backend/src/memberships/dto/update-membership.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipDto } from './create-membership.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}