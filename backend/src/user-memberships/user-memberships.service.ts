import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserMembership } from './schemas/user-membership.schema';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { User } from '../auth/schemas/user.schema';
import { Membership } from '../memberships/schemas/membership.schema';

@Injectable()
export class UserMembershipsService {
  constructor(
    @InjectModel(UserMembership.name)
    private userMembershipModel: Model<UserMembership>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
  ) {}

  /**
   * Para que el Admin asigne una membresía manualmente.
   */
  async create(
    createUserMembershipDto: CreateUserMembershipDto,
  ): Promise<UserMembership> {
    const { userId, membershipId } = createUserMembershipDto;

    const [user, membershipPlan] = await Promise.all([
      this.userModel.findById(userId),
      this.membershipModel.findById(membershipId),
    ]);

    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!membershipPlan) throw new NotFoundException('Plan de membresía no encontrado');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + membershipPlan.durationDays);

    const newUserMembership = new this.userMembershipModel({
      user: userId,
      membership: membershipId,
      startDate,
      endDate,
      classesRemaining: membershipPlan.classesPerWeek * (membershipPlan.durationDays / 7),
      status: 'ACTIVE',
      paymentDetails: null, // Asignación manual no tiene pago de PayPal
    });

    return newUserMembership.save();
  }

  /**
   * Para que el Admin vea TODAS las membresías.
   */
  async findAll(): Promise<UserMembership[]> {
    return this.userMembershipModel
      .find()
      .populate('user', 'firstName paternalLastName email') 
      .populate('membership', 'name')
      .exec();
  }
  
  // --- MÉTODO AÑADIDO (PARA CORREGIR EL ERROR 1) ---
  /**
   * Para que un CLIENTE vea solo SUS membresías.
   */
  async findMyMemberships(userId: string): Promise<UserMembership[]> {
    return this.userMembershipModel
      .find({ user: userId }) // Busca solo por el ID del usuario
      .populate('membership', 'name durationDays classesPerWeek') // El cliente quiere ver detalles
      .sort({ startDate: -1 }) // Mostrar la más reciente primero
      .exec();
  }

  /**
   * Para que el Admin revoque/cancele una membresía.
   */
  async delete(id: string): Promise<void> {
    const membership = await this.userMembershipModel.findById(id);
    if (!membership) {
      throw new NotFoundException('Membresía de usuario no encontrada');
    }
    
    membership.status = 'CANCELLED';
    membership.classesRemaining = 0;
    await membership.save();
  }
}