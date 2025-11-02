import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../auth/schemas/user.schema';
import { Membership } from '../memberships/schemas/membership.schema';
import { UserMembership } from '../user-memberships/schemas/user-membership.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  /**
   * Envía un correo de bienvenida y verificación.
   */
  async sendUserWelcome(user: User, token: string) {
    const verificationUrl = `http://localhost:5173/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '¡Bienvenido a GymApp! Confirma tu correo',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>¡Hola, ${user.firstName}!</h2>
          <p>Gracias por registrarte en GymApp. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
          <p>
            <a href="${verificationUrl}" 
               style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verificar mi correo
            </a>
          </p>
          <p>Si no te registraste, por favor ignora este mensaje.</p>
        </div>
      `,
    });
  }

  /**
   * Envía un correo de recuperación de contraseña.
   */
  async sendPasswordReset(user: User, resetCode: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Tu Código de Recuperación de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>¡Hola, ${user.firstName}!</h2>
          <p>Hemos recibido una solicitud para reiniciar tu contraseña. Usa el siguiente código para continuar:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f4f4f4; padding: 10px; text-align: center;">
            ${resetCode}
          </p>
          <p>Este código expira en 10 minutos.</p>
          <p>Si no solicitaste esto, por favor ignora este mensaje.</p>
        </div>
      `,
    });
  }

  /**
   * Envía un recibo de compra.
   */
  async sendPurchaseReceipt(
    user: User,
    membership: Membership,
    purchase: UserMembership,
  ) {
    const totalClasses = membership.classesPerWeek * (membership.durationDays / 7);
    const payment = purchase.paymentDetails; // payment puede ser 'null'
    const startDate = new Date(purchase.startDate).toLocaleDateString('es-ES');
    const endDate = new Date(purchase.endDate).toLocaleDateString('es-ES');

    // --- AQUÍ ESTÁ LA CORRECCIÓN ---
    // Si no hay detalles de pago, no se puede enviar un recibo detallado.
    if (!payment) {
      console.error(`[MailService] No se pueden enviar detalles de pago para el usuario ${user.email} porque 'paymentDetails' es nulo.`);
      return; // Detener la función si no hay 'payment'
    }
    // --- FIN DE LA CORRECCIÓN ---

    // A partir de aquí, TypeScript sabe que 'payment' no es nulo.
    await this.mailerService.sendMail({
      to: user.email,
      subject: `Confirmación de tu compra en GymApp: ${membership.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #F97316; text-align: center;">¡Gracias por tu compra, ${user.firstName}!</h2>
          <p>Tu membresía ha sido activada. Aquí están los detalles de tu compra:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Plan Adquirido:</td>
              <td style="padding: 10px 0; text-align: right;">${membership.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Duración:</td>
              <td style="padding: 10px 0; text-align: right;">${membership.durationDays} días</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Clases Totales:</td>
              <td style="padding: 10px 0; text-align: right;">${totalClasses} clases</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Válido desde:</td>
              <td style="padding: 10px 0; text-align: right;">${startDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Válido hasta:</td>
              <td style="padding: 10px 0; text-align: right;">${endDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Gimnasio:</td>
              <td style="padding: 10px 0; text-align: right;">GymApp (Acceso General)</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 30px; border-bottom: 2px solid #F97316; padding-bottom: 5px;">Detalles del Pago</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">Método de Pago:</td>
              <td style="padding: 8px 0; text-align: right;">PayPal</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">ID de Orden PayPal:</td>
              <td style="padding: 8px 0; text-align: right;">${payment.paypalOrderId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold;">Total Pagado:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 1.2em;">
                $${Number(payment.amount).toFixed(2)} ${payment.currency}
              </td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 0.9em; color: #777; text-align: center;">
            ¡Nos vemos en el gimnasio!
          </p>
        </div>
      `,
    });
  }
}