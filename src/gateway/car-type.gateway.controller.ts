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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Car-Types')
@ApiBearerAuth('access-token')
@Controller('cartypes')
export class CarTypeGatewayController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @ApiTags('Car Type')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Req() req,

    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_Type_FIND_ALL, {
      headers: { authorization: authHeader },

      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_Type_FIND_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Post()
  async create(@Req() req, @Body() dto: CarMakeDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(
      PATTERNS.CAR_Type_CREATE,

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

    return this.client.send(PATTERNS.CAR_Type_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    console.log('pppppppppppppppppppppppp:1111111111');
    const authHeader = req.headers['authorization'] || null;

    return this.client.send(PATTERNS.CAR_Type_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
}
