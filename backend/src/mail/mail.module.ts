import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      // Usamos 'useFactory' para inyectar el ConfigService
      // y leer las variables de entorno de forma asíncrona
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
      inject: [ConfigService], // Inyectamos el servicio de configuración
    }),
  ],
  providers: [MailService],
  exports: [MailService], // Exportamos el servicio para usarlo en otros módulos
})
export class MailModule {}