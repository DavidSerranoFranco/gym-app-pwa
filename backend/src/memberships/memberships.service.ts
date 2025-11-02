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

  /**
   * (Esta función es la que estaba fallando con ERR_EMPTY_RESPONSE)
   * Ahora es pública y no requiere autenticación
   */
  async findAll(): Promise<Membership[]> {
    return this.membershipModel.find().exec();
  }

  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipModel.findById(id).exec();
    if (!membership) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return membership;
  }

  /**
   * Al crear, usamos los nombres de campos nuevos
   */
  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    // Asegurarse de que el DTO coincida con el schema
    const newMembership = new this.membershipModel({
      ...createMembershipDto,
      // Los DTOs ya deberían tener los nombres correctos (durationDays, classesPerWeek)
    });
    return newMembership.save();
  }

  /**
   * Al actualizar, usamos los nombres de campos nuevos
   */
  async update(id: string, updateMembershipDto: UpdateMembershipDto): Promise<Membership> {
    const existingMembership = await this.membershipModel
      .findByIdAndUpdate(id, updateMembershipDto, { new: true }) // new: true devuelve el doc actualizado
      .exec();

    if (!existingMembership) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return existingMembership;
  }

  async remove(id: string): Promise<void> {
    const result = await this.membershipModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
  }
}