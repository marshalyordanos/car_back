import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreatePaymentDto,
  RefundPaymentDto,
  ReleasePaymentDto,
} from '../rental-service/payment/payment.entity';

@Controller('payments')
export class PaymentGatewayController {
  constructor(
    @Inject('RENTAL_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}
  @Post()
  async create(@Req() req, @Body() dto: CreatePaymentDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_CREATE, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Post('release')
  async releaseToHost(@Req() req, @Body() dto: ReleasePaymentDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_RELEASE_TO_HOST, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Post('refund')
  async refund(@Req() req, @Body() dto: RefundPaymentDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_REFUND, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Get(':id')
  async getById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_GET_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('booking/:bookingId')
  async getByBooking(@Req() req, @Param('bookingId') bookingId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_GET_BY_BOOKING, {
      headers: { authorization: authHeader },
      bookingId,
    });
  }

  @Get('user/:userId')
  async getByUser(@Req() req, @Param('userId') userId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_GET_BY_USER, {
      headers: { authorization: authHeader },
      userId,
    });
  }

  @Get()
  async getAll(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.paymentClient.send(PATTERNS.PAYMENT_GET_ALL, {
      headers: { authorization: authHeader },
    });
  }
}
