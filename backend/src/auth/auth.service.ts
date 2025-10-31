import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
}