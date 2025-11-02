import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService implements OnModuleInit {
  private paypalClient: checkoutNodeJssdk.core.PayPalHttpClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const environment = this.configService.get<string>('PAYPAL_ENVIRONMENT');

    if (!clientId || !clientSecret) {
      throw new Error('Faltan las credenciales de PayPal (CLIENT_ID o CLIENT_SECRET)');
    }

    const payPalEnvironment =
      environment === 'live'
        ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
        : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

    this.paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(payPalEnvironment);
  }

  client() {
    return this.paypalClient;
  }
}