import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from '../memberships/schemas/membership.schema';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { UserMembership, UserMembershipDocument } from './schemas/user-membership.schema';

@Injectable()
export class UserMembershipsService {
  constructor(
    @InjectModel(UserMembership.name)
    private userMembershipModel: Model<UserMembershipDocument>,
    @InjectModel(Membership.name)
    private membershipModel: Model<Membership>, // Inyecta el modelo de Membership
  ) {}

  async create(createUserMembershipDto: CreateUserMembershipDto) {
    // 1. Busca el plan de membresía para obtener su duración y número de clases
    const membershipPlan = await this.membershipModel
      .findById(createUserMembershipDto.membership)
      .exec();
    if (!membershipPlan) {
      throw new NotFoundException('El plan de membresía no fue encontrado');
    }

    // 2. Calcula las fechas
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + membershipPlan.durationInDays);

    // 3. Crea el nuevo documento de suscripción
    const newUserMembership = new this.userMembershipModel({
      ...createUserMembershipDto,
      startDate,
      endDate,
      classesRemaining: membershipPlan.classCount, // Asigna el número de clases del plan
    });

    return newUserMembership.save();
  }

  async remove(id: string) {
    const result = await this.userMembershipModel.findByIdAndDelete(id).exec();
    if (!result) {
        throw new NotFoundException(`Suscripción con ID "${id}" no encontrada`);
    }
    return { message: 'Suscripción eliminada exitosamente' };
    }

  findAll() {
    // Populamos para traer la info completa del usuario y del plan
    return this.userMembershipModel.find().populate('user').populate('membership').exec();
  }

  async findMyMemberships(userId: string) {
    return this.userMembershipModel
      .find({ user: userId })
      .populate('membership') // Trae la info del plan (nombre, precio, etc.)
      .sort({ status: 1, endDate: -1 }) // Muestra activas primero
      .exec();
  }

}