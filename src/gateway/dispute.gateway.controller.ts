import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Patch,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateDisputeDto,
  UpdateDisputeStatusDto,
} from '../rental-service/dispute/dispute.entity';

@Controller('disputes')
export class DisputeGatewayController {
  constructor(
    @Inject('RENTAL_SERVICE') private readonly disputeClient: ClientProxy,
  ) {}
  @Post()
  async createDispute(@Req() req, @Body() dto: CreateDisputeDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_CREATE, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Get(':id')
  async getById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_GET_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('user/:userId')
  async getByUser(@Req() req, @Param('userId') userId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_GET_BY_USER, {
      headers: { authorization: authHeader },
      userId,
    });
  }

  @Get()
  async getAll(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_GET_ALL, {
      headers: { authorization: authHeader },
    });
  }

  @Patch('resolve')
  async resolve(@Req() req, @Body() dto: UpdateDisputeStatusDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_RESOLVE, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Patch('reject')
  async reject(@Req() req, @Body() dto: UpdateDisputeStatusDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_REJECT, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }
}
