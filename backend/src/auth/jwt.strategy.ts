import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    // Obtenemos el secreto ANTES de llamar a super()
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // Verificamos que el secreto exista. Si no, la aplicación no debe iniciar.
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está definido en el archivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret, // <-- Ahora pasamos una variable que sabemos que es un string
    });
  }

  async validate(payload: { id: string }): Promise<User> {
    const { id } = payload;
    const user = await this.userModel.findById(id);


    if (!user) {
      throw new UnauthorizedException('Token no válido');
    }
    // Devolvemos el objeto de usuario completo, que se adjuntará a la `request`.
    return user;
  }
}