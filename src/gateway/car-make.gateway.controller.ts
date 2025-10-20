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
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CarMakeDto,
  CarMakeUpdateDto,
} from '../operations/car-make/car-make.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Car-makes')
@ApiBearerAuth('access-token')
@Controller('car-makes')
export class CarMakeGatewayController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  async findAll(
    @Req() req,

    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MAKE_FIND_ALL, {
      headers: { authorization: authHeader },

      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MAKE_FIND_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Post()
  async create(@Req() req, @Body() dto: CarMakeDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(
      PATTERNS.CAR_MAKE_CREATE,

      {
        headers: { authorization: authHeader },
        data: dto,
      },
    );
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CarMakeUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MAKE_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_MAKE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
}
