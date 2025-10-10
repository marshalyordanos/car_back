import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { PATTERNS } from '../contracts';
import {
  AddCarInsuranceDto,
  CarDto,
  CarSearchFilter,
  UpdateCarInsuranceDto,
} from '../operations/car/car.entity';
import multer from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ListQueryDto } from '../common/query/query.dto';

@Controller('cars')
export class CarGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly carClient: ClientProxy,
  ) {}

  @Post('insurance')
  async addInsurance(@Req() req, @Body() dto: AddCarInsuranceDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.carClient.send(PATTERNS.CAR_INSURANCE_ADD, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Patch('insurance/:id')
  async updateInsurance(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCarInsuranceDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.carClient.send(PATTERNS.CAR_INSURANCE_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Delete('insurance/:id')
  async deleteInsurance(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.carClient.send(PATTERNS.CAR_INSURANCE_DELETE, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('insurance/:carId')
  async getByCar(@Req() req, @Param('carId') carId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.carClient.send(PATTERNS.CAR_INSURANCE_GET_BY_CAR, {
      headers: { authorization: authHeader },
      carId,
    });
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'photos', maxCount: 7 }],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  createCar(
    @Req() req,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },

    @Body() dto: CarDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    const photos = files.photos; // get the array from the object

    if (photos && photos.length > 0) {
      dto.photos = photos; // assign only if there are files
    }

    return this.carClient.send(PATTERNS.CAR_CREATE, {
      headers: { authorization: authHeader },
      carData: dto,
      hostId: dto.hostId,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'photos', maxCount: 7 }],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  updateCar(
    @Req() req,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Param('id') id: string,
    @Body() dto: Partial<CarDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;
    const photos = files.photos; // get the array from the object

    if (photos && photos.length > 0) {
      dto.photos = photos; // assign only if there are files
    }

    console.log('--------------- car updated', id);

    return this.carClient.send(PATTERNS.CAR_UPDATE, {
      headers: { authorization: authHeader },
      carId: id,
      carData: dto,
      hostId: dto.hostId,
    });
  }

  @Delete(':id')
  deleteCar(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.carClient.send(PATTERNS.CAR_DELETE, {
      headers: { authorization: authHeader },
      carId: id,
    });
  }

  @Get(':id')
  getCar(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.carClient.send(PATTERNS.CAR_FIND_BY_ID, {
      headers: { authorization: authHeader },
      carId: id,
    });
  }

  @Get()
  searchCars(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.carClient.send(PATTERNS.CAR_SEARCH, {
      headers: { authorization: authHeader },
      query,
    });
  }
}
