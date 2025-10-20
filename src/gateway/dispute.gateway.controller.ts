import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Patch,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateDisputeDto,
  DisputeResolveDto,
  UpdateDisputeStatusDto,
} from '../rental-service/dispute/dispute.entity';
import { ListQueryDto } from '../common/query/query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Disputes')
@ApiBearerAuth('access-token')
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
      data: dto,
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
  async getAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_GET_ALL, {
      query,
      headers: { authorization: authHeader },
    });
  }

  // Admin endpoints for review/resolve/reject
  @Post(':id/review')
  async adminReview(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_ADMIN_REVIEW, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Post(':id/resolve')
  async resolve(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: DisputeResolveDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_RESOLVE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Post(':id/reject')
  async reject(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.disputeClient.send(PATTERNS.DISPUTE_REJECT, {
      id,
      headers: { authorization: authHeader },
    });
  }
}
