import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MailService } from '../mail/mail.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Booking } from '../bookings/schemas/booking.schema';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckIn } from '../check-ins/schemas/check-in.schema';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UserMembership } from '../user-memberships/schemas/user-membership.schema';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserMembership.name)
    private userMembershipModel: Model<UserMembership>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckIn>,
    public jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // --- MÉTODO REGISTER CORREGIDO ---
  async register(createAuthDto: CreateAuthDto): Promise<any> { // Tipo de retorno 'any' para simplificar
    const { 
      email, 
      password, 
      firstName, 
      paternalLastName, 
      maternalLastName, 
      gender, 
      state, 
      age 
    } = createAuthDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const userCount = await this.userModel.countDocuments().exec();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.CLIENT;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomBytes(32).toString('hex');

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      paternalLastName,
      maternalLastName: maternalLastName || '',
      gender,
      state,
      age,
      role,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
    });

    try {
      await this.mailService.sendUserWelcome(newUser, verificationToken);
    } catch (error) {
      console.error("Error al enviar correo de verificación:", error);
      throw new BadRequestException('No se pudo enviar el correo de verificación. Inténtalo de nuevo.');
    }

    // --- CORRECCIÓN DE LÓGICA ---
    // 1. Guardar el usuario
    const savedUser = await newUser.save();
    
    // 2. Quitar la contraseña ANTES de devolverlo
    const { password: pw, ...result } = savedUser.toObject(); 
    
    // 3. Devolver el objeto limpio
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isEmailVerified && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
    }
    
    if (!user.password && user.googleId) {
      throw new UnauthorizedException('Esta cuenta se registró con Google. Por favor, inicia sesión con Google.');
    }
    
    if (!user.password) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: user._id, name: user.firstName, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async findAllClients() {
    return this.userModel.find({ role: UserRole.CLIENT }).select('-password').exec();
  }

  async findClientProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const [memberships, bookings, checkIns] = await Promise.all([
      this.userMembershipModel
        .find({ user: userId })
        .populate('membership')
        .sort({ startDate: -1 }),
      this.bookingModel
        .find({ user: userId })
        .populate({
          path: 'schedule',
          populate: { path: 'location' },
        })
        .sort({ bookingDate: -1 }),
      this.checkInModel
        .find({ user: userId })
        .populate('location')
        .sort({ checkInTime: -1 }),
    ]);

    return {
      user,
      memberships,
      bookings,
      checkIns,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateProfileDto },
      { new: true },
    )
    .select('-password')
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user || !user.password) {
      return { message: 'Si existe una cuenta con este correo, se ha enviado un código de recuperación.' };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = expires;
    await user.save();

    try {
      await this.mailService.sendPasswordReset(user, resetCode);
      return { message: 'Si existe una cuenta con este correo, se ha enviado un código de recuperación.' };
    } catch (error) {
      console.error("Error al enviar correo:", error);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw new BadRequestException('Error al enviar el correo. Inténtalo de nuevo.');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, code, newPassword } = resetPasswordDto;

    const user = await this.userModel.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('El código es inválido o ha expirado.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return { message: 'Contraseña actualizada con éxito.' };
  }

  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    name: string;
    profilePictureUrl: string;
  }) {
    let user = await this.userModel.findOne({ googleId: googleProfile.googleId }).exec();
    if (user) {
      return user;
    }

    user = await this.userModel.findOne({ email: googleProfile.email }).exec();
    
    const nameParts = googleProfile.name.split(' ');
    const firstName = nameParts[0];
    const paternalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    if (user) {
      user.googleId = googleProfile.googleId;
      user.profilePictureUrl = user.profilePictureUrl || googleProfile.profilePictureUrl;
      user.isEmailVerified = true; 
      await user.save();
      return user;
    }

    const newUser = new this.userModel({
      googleId: googleProfile.googleId,
      email: googleProfile.email,
      firstName: firstName,
      paternalLastName: paternalLastName,
      profilePictureUrl: googleProfile.profilePictureUrl,
      role: UserRole.CLIENT,
      isEmailVerified: true,
    });

    await newUser.save();
    return newUser;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      throw new BadRequestException('El token de verificación es inválido o ha expirado.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return { message: '¡Correo verificado con éxito! Ya puedes iniciar sesión.' };
  }
  
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.password) {
      throw new BadRequestException(
        'No puedes cambiar tu contraseña porque te registraste usando un proveedor externo (Google).',
      );
    }

    const isPasswordMatched = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Contraseña actualizada con éxito.' };
  }
}