import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ListQueryDto } from '../common/query/query.dto';
import { PATTERNS } from '../contracts';
import {
  CancellationPolicyDto,
  CancellationPolicyUpdateDto,
} from '../rental-service/cancellation-policy/cancellation-policy.entity';

@Controller('cancellation-policies')
export class CancellationPolicyGatewayController {
  constructor(@Inject('RENTAL_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  async findAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_FIND_ALL, {
      query,
      headers: { authorization: authHeader },
    });
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Post()
  async create(@Req() req, @Body() dto: CancellationPolicyDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CancellationPolicyUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Post('seed')
  async seed(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CANCELLATION_POLICY_SEED, {
      headers: { authorization: authHeader },
    });
  }
}
