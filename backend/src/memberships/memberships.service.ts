// backend/src/memberships/memberships.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Membership, MembershipDocument } from './schemas/membership.schema';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
  ) {}

  // --- Crear una nueva membresía ---
  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    const createdMembership = new this.membershipModel(createMembershipDto);
    return createdMembership.save();
  }

  // --- Encontrar todas las membresías ---
  async findAll(): Promise<Membership[]> {
    return this.membershipModel.find().exec();
  }

  // --- Encontrar una membresía por su ID ---
  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipModel.findById(id).exec();
    if (!membership) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return membership;
  }

  // --- Actualizar una membresía ---
  async update(id: string, updateMembershipDto: UpdateMembershipDto): Promise<Membership> {
    const updatedMembership = await this.membershipModel
      .findByIdAndUpdate(id, updateMembershipDto, { new: true }) // {new: true} devuelve el documento actualizado
      .exec();

    if (!updatedMembership) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return updatedMembership;
  }

  // --- Borrar una membresía ---
  async remove(id: string) {
    const result = await this.membershipModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return { message: 'Membresía eliminada exitosamente' };
  }
}