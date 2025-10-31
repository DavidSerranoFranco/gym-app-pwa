import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from '../memberships/schemas/membership.schema';
import { UserMembershipsService } from '../user-memberships/user-memberships.service';

@Injectable()
export class PaymentsService {
  private payPalClient: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    private userMembershipsService: UserMembershipsService,
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      this.configService.get('PAYPAL_CLIENT_ID'),
      this.configService.get('PAYPAL_CLIENT_SECRET'),
    );
    this.payPalClient = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(membershipId: string) {
    const membership = await this.membershipModel.findById(membershipId);
    if (!membership) throw new NotFoundException('Membresía no encontrada');

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: membership.price.toString(),
        },
        description: `Membresía: ${membership.name}`,
        // --- CAMBIO CLAVE: Adjuntamos el ID de la membresía a la orden ---
        custom_id: membershipId, 
      }],
    });

    try {
      const order = await this.payPalClient.execute(request);
      return { orderID: order.result.id };
    } catch (err) {
      throw new InternalServerErrorException('Error al crear la orden de PayPal');
    }
  }

  async captureOrder(orderID: string, userId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
      const capture = await this.payPalClient.execute(request);
      const status = capture.result.status;

      if (status === 'COMPLETED') {
        const purchaseUnit = capture.result.purchase_units[0];
        // --- CAMBIO CLAVE: Leemos el ID de la membresía directamente ---
        const membershipId = purchaseUnit.custom_id; 

        if (!membershipId) throw new InternalServerErrorException('No se encontró el ID de la membresía en la orden de PayPal');

        // Crea la suscripción para el usuario usando el ID recuperado
        await this.userMembershipsService.create({
          user: userId,
          membership: membershipId,
        });

        return { status: 'success', message: 'Pago completado y membresía activada.' };
      }
    } catch (err) {
      console.error(err); // Es bueno loguear el error real en el servidor
      throw new InternalServerErrorException('Error al capturar el pago de PayPal');
    }
  }
}