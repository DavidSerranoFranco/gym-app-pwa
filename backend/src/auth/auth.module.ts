import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './google.strategy';

// Imports de los otros schemas que AuthService necesita
import { UserMembership, UserMembershipSchema } from '../user-memberships/schemas/user-membership.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { CheckIn, CheckInSchema } from '../check-ins/schemas/check-in.schema';

@Module({
  imports: [
    ConfigModule, // Asegúrate de que ConfigModule esté importado
    
    // 1. PassportModule va aquí, en el nivel superior
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // 2. JwtModule (separado)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule aquí para que useFactory funcione
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }, // '1d' (un día) es más común que 'id'
      }),
      inject: [ConfigService],
    }), // <-- JwtModule se cierra aquí

    // 3. MongooseModule (separado)
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: CheckIn.name, schema: CheckInSchema },
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}