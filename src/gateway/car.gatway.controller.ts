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
  CarDateDto,
  CarDto,
  CarSearchFilter,
  UpdateCarInsuranceDto,
} from '../operations/car/car.entity';
import multer from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ListQueryDto } from '../common/query/query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Cars')
@ApiBearerAuth('access-token')
@Controller('cars')
export class CarGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly carClient: ClientProxy,
  ) {}

  @Post('insurance')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'documentFile', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  async addInsurance(
    @Req() req,
    @UploadedFiles() files: { documentFile?: Express.Multer.File[] },
    @Body() dto: AddCarInsuranceDto,
  ) {
    dto.documentFile = files?.documentFile?.[0];

    const authHeader = req.headers['authorization'] || null;
    return this.carClient.send(PATTERNS.CAR_INSURANCE_ADD, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Patch('insurance/:id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'documentFile', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  async updateInsurance(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() files: { documentFile?: Express.Multer.File[] },
    @Body() dto: UpdateCarInsuranceDto,
  ) {
    dto.documentFile = files?.documentFile?.[0];

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
      [
        { name: 'photos', maxCount: 7 },
        { name: 'technicalInspectionCertificate', maxCount: 1 },
        { name: 'gpsInstallationReceipt', maxCount: 1 },
      ],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  createCar(
    @Req() req,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      technicalInspectionCertificate?: Express.Multer.File[];
      gpsInstallationReceipt?: Express.Multer.File[];
    },

    @Body() dto: CarDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    const photos = files.photos; // get the array from the object

    if (photos && photos.length > 0) {
      dto.photos = photos; // assign only if there are files
    }
    if (files.technicalInspectionCertificate)
      dto.technicalInspectionCertificate =
        files.technicalInspectionCertificate[0];
    if (files.gpsInstallationReceipt)
      dto.gpsInstallationReceipt = files.gpsInstallationReceipt[0];

    return this.carClient.send(PATTERNS.CAR_CREATE, {
      headers: { authorization: authHeader },
      carData: dto,
      hostId: dto.hostId,
    });
  }
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 7 },
        { name: 'technicalInspectionCertificate', maxCount: 1 },
        { name: 'gpsInstallationReceipt', maxCount: 1 },
      ],
      { storage: multer.memoryStorage() },
    ),
  )
  updateCar(
    @Req() req,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      technicalInspectionCertificate?: Express.Multer.File[];
      gpsInstallationReceipt?: Express.Multer.File[];
    },
    @Param('id') id: string,
    @Body() dto: Partial<CarDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;

    if (files.photos) dto.photos = files.photos;
    if (files.technicalInspectionCertificate)
      dto.technicalInspectionCertificate =
        files.technicalInspectionCertificate[0];
    if (files.gpsInstallationReceipt)
      dto.gpsInstallationReceipt = files.gpsInstallationReceipt[0];

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

  @Get('admin')
  searchCarsAdmin(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    console.log('carparams: ', query);

    return this.carClient.send(PATTERNS.CAR_SEARCH_ADMIN, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get()
  searchCars(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    console.log('carparams: ', query);

    return this.carClient.send(PATTERNS.CAR_SEARCH, {
      headers: { authorization: authHeader },
      query,
    });
  }
  @Get(':id')
  getCar(@Param('id') id: string, @Query() query: CarDateDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.carClient.send(PATTERNS.CAR_FIND_BY_ID, {
      headers: { authorization: authHeader },
      carId: id,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
