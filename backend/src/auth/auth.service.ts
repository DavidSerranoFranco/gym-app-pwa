import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UserMembership } from '../user-memberships/schemas/user-membership.schema';
import { Booking } from '../bookings/schemas/booking.schema';
import { CheckIn } from '../check-ins/schemas/check-in.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserMembership.name)
    private userMembershipModel: Model<UserMembership>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckIn>,
    private jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<User> {
    const { name, email, password } = createAuthDto;

    // Verificar si el email ya existe
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Lógica para asignar el rol de ADMIN al primer usuario
    const userCount = await this.userModel.countDocuments().exec();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.CLIENT;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario con el rol asignado
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return newUser.save();
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar al usuario por email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar la contraseña
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el token incluyendo id, name y role
    const payload = { id: user._id, name: user.name, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async findAllClients() {
    // Devuelve todos los usuarios que tienen el rol de CLIENT
    return this.userModel.find({ role: UserRole.CLIENT }).select('-password').exec();
  }

  async findClientProfile(userId: string) {
    // 1. Buscamos al usuario
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Buscamos todas sus relaciones en paralelo
    const [memberships, bookings, checkIns] = await Promise.all([
      // Suscripciones (con el plan populado)
      this.userMembershipModel
        .find({ user: userId })
        .populate('membership')
        .sort({ startDate: -1 }),

      // Reservas (con el horario y sucursal populados)
      this.bookingModel
        .find({ user: userId })
        .populate({
          path: 'schedule',
          populate: { path: 'location' },
        })
        .sort({ bookingDate: -1 }),

      // Historial de acceso (con la sucursal populada)
      this.checkInModel
        .find({ user: userId })
        .populate('location')
        .sort({ checkInTime: -1 }),
    ]);

    // 3. Devolvemos el perfil completo
    return {
      user,
      memberships,
      bookings,
      checkIns,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Busca al usuario por ID y actualiza los campos del DTO
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateProfileDto }, // $set asegura que solo se actualicen los campos presentes en el DTO
      { new: true }, // 'new: true' hace que devuelva el documento actualizado
    )
    .select('-password') // Nunca devolver la contraseña
    .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return updatedUser;
  }

  async updateProfilePicture(userId: string, fileUrl: string) {
  if (!fileUrl) {
    throw new BadRequestException('No se proporcionó la URL del archivo.');
  }

  // Actualizamos solo el campo 'profilePictureUrl'
  const updatedUser = await this.userModel.findByIdAndUpdate(
    userId,
    { $set: { profilePictureUrl: fileUrl } },
    { new: true },
  )
  .select('-password')
  .exec();

  if (!updatedUser) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return updatedUser;
  }

  async getMyProfile(userId: string) {
  const user = await this.userModel.findById(userId).select('-password').exec();
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }
  return user;
  }
}