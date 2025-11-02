import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from '../memberships/schemas/membership.schema';
import { User } from '../auth/schemas/user.schema';
import { UserMembership } from '../user-memberships/schemas/user-membership.schema';
import { PaypalService } from './paypal.service';
import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserMembership.name) private userMembershipModel: Model<UserMembership>,
    private paypalService: PaypalService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * 1. Crear Orden en PayPal
   */
  async createOrder(membershipId: string, userId: string) {
    const membership = await this.membershipModel.findById(membershipId);
    if (!membership) {
      throw new NotFoundException('Membresía no encontrada');
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: this.configService.get<string>('PAYPAL_CURRENCY', 'MXN'),
          value: membership.price.toString(),
        },
        description: `Membresía: ${membership.name}`,
        reference_id: `${membershipId}_${userId}`, // Guardamos IDs para la captura
      }],
    });

    try {
      const order = await this.paypalService.client().execute(request);
      return { orderID: order.result.id };
    } catch (error) {
      console.error("Error al crear la orden de PayPal:", error);
      throw new InternalServerErrorException('No se pudo crear la orden de PayPal');
    }
  }

  /**
   * 2. Capturar Orden en PayPal
   */
  async captureOrder(orderID: string, membershipId: string, userId: string) {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
      const capture = await this.paypalService.client().execute(request);

      if (capture.result.status === 'COMPLETED') {
        const membership = await this.membershipModel.findById(membershipId);
        const user = await this.userModel.findById(userId);
        
        if (!membership || !user) {
          throw new NotFoundException('Usuario o Membresía no encontrados');
        }
        
        const purchaseUnit = capture.result.purchase_units[0];
        const capturedPayment = purchaseUnit.payments.captures[0];
        const amount = capturedPayment.amount.value;
        const currency = capturedPayment.amount.currency_code;

        // --- ZONA DE CORRECIÓN (El error NaN / Invalid Date) ---
        
        // 1. Leer los valores directamente del 'membership'
        const duration = membership.durationDays;
        const totalClasses = membership.totalClasses; // <-- Leemos el total directo

        // 2. Validar que la membresía no esté corrupta
        if (typeof duration !== 'number' || typeof totalClasses !== 'number') {
          console.error(`Error de Base de Datos: La membresía "${membership.name}" no tiene 'durationDays' o 'totalClasses' definidos.`);
          throw new InternalServerErrorException('Error en la configuración de la membresía.');
        }

        // 3. Calcular la fecha de expiración (Ahora SÍ funciona)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + duration);

        // 4. Activar la membresía (Ahora SÍ funciona)
        const newUserMembership = new this.userMembershipModel({
          user: userId,
          membership: membershipId,
          startDate: new Date(),
          endDate: expirationDate, // <-- Ya no es "Invalid Date"
          classesRemaining: totalClasses, // <-- Ya no es "NaN"
          status: 'ACTIVE',
          paymentDetails: {
            paypalOrderId: orderID,
            amount,
            currency,
            status: 'COMPLETED',
          },
        });
        
        // --- FIN DE LA ZONA DE CORRECIÓN ---

        await newUserMembership.save();
        
        user.points = (user.points || 0) + (membership.points || 0);
        await user.save();
        
        try {
          await this.mailService.sendPurchaseReceipt(user, membership, newUserMembership);
        } catch (emailError) {
          console.error(`[PaymentsService] Pago ${orderID} exitoso, pero falló el envío de correo a ${user.email}:`, emailError);
        }
        
        return {
          message: 'Pago completado y membresía activada',
          membership: newUserMembership,
        };

      } else {
        throw new BadRequestException('El pago no fue completado por PayPal.');
      }
    } catch (error) {
      // Si el error es de validación (como el NaN), lo veremos aquí
      console.error("Error al capturar la orden de PayPal:", error); 
      if (error.statusCode === 422) {
         throw new BadRequestException('Esta orden de pago ya fue procesada.');
      }
      throw new InternalServerErrorException('No se pudo capturar el pago.');
    }
  }
}