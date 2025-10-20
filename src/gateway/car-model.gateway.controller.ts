import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import {
  CarModelDto,
  CarModelUpdateDto,
} from '../operations/car-model/car-model.entity';
import { PATTERNS } from '../contracts';
import { ListQueryDto } from '../common/query/query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Car-models')
@ApiBearerAuth('access-token')
@Controller('car-models')
export class CarModelGatewayController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  async findAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log('payload: ', query);

    return this.client.send(PATTERNS.CAR_MODEL_FIND_ALL, {
      headers: { authorization: authHeader },

      query,
    });
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MODEL_FIND_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Post()
  async create(@Req() req, @Body() dto: CarModelDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MODEL_CREATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CarModelUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MODEL_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MODEL_DELETE, {
      headers: { authorization: authHeader },
      id,
    });
  }
}
