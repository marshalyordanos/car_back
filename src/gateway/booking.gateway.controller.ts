// booking.gateway.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Req,
  Inject,
  Query,
  UseInterceptors,
  UploadedFiles,
  All,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  BookingChangeStatusDto,
  BookingInspectionDto,
  BookingInspectionUpdateDto,
  CreateBookingDto,
  UpdateBookingDto,
} from '../rental-service/booking/booking.entity';
import { ListQueryDto } from '..//common/query/query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import multer from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
export class BookingGatewayController {
  constructor(@Inject('RENTAL_SERVICE') private readonly client: ClientProxy) {}
  private getAuth(req) {
    return req.headers['authorization'] || null;
  }

  // .............................................. inceptions ......................................
  @Get('inspection')
  async findAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_INSPECTION_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('inspection/:id')
  async findById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_INSPECTION_FIND_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Post('inspection')
  async create(@Req() req, @Body() dto: BookingInspectionDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_INSPECTION_CREATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Patch('inspection/approve/:id')
  async approve(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_INSPECTION_APPROVE, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Patch('inspection/:id')
  async udpateInspection(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: BookingInspectionUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_INSPECTION_UPDATE, {
      headers: { authorization: authHeader },
      id: id,
      data: dto,
    });
  }

  // .............................................. inceptions ......................................

  @Patch(':id/cancel-guest')
  async cancelByGuest(@Req() req, @Param('id') id: string) {
    return this.client.send(PATTERNS.BOOKING_CANCEL_BY_GUEST, {
      headers: { authorization: this.getAuth(req) },
      id,
    });
  }

  @Patch(':id/confirm-host')
  async confirmByHost(@Req() req, @Param('id') id: string) {
    return this.client.send(PATTERNS.BOOKING_CONFIRM_BY_HOST, {
      headers: { authorization: this.getAuth(req) },
      id,
    });
  }

  @Patch(':id/reject-host')
  async rejectByHost(@Req() req, @Param('id') id: string) {
    return this.client.send(PATTERNS.BOOKING_REJECT_BY_HOST, {
      headers: { authorization: this.getAuth(req) },
      id,
    });
  }

  @Patch(':id/cancel-host')
  async cancelByHost(@Req() req, @Param('id') id: string) {
    return this.client.send(PATTERNS.BOOKING_CANCEL_BY_HOST, {
      headers: { authorization: this.getAuth(req) },
      id,
    });
  }

  @Patch(':id/complete-host')
  async completeByHost(@Req() req, @Param('id') id: string) {
    return this.client.send(PATTERNS.BOOKING_COMPLETE_BY_HOST, {
      headers: { authorization: this.getAuth(req) },
      id,
    });
  }

  @Patch(':id/change-status-admin')
  async cancelByAdmin(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: BookingChangeStatusDto,
  ) {
    console.log('dto: ', dto);
    return this.client.send(PATTERNS.BOOKING_CANCEL_BY_ADMIN, {
      headers: { authorization: this.getAuth(req) },
      id,
      dto: dto,
    });
  }

  @Post()
  async createBooking(@Req() req, @Body() dto: CreateBookingDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_CREATE, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Post('guest')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'driverLicenseFile', maxCount: 1 },
        { name: 'nationalIdFile', maxCount: 1 },
      ],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  async createBookingGuest(
    @UploadedFiles()
    files: {
      driverLicenseFile?: Express.Multer.File[];
      nationalIdFile?: Express.Multer.File[];
    },
    @Req() req,
    @Body() dto: CreateBookingDto,
  ) {
    dto.driverLicenseFile = files?.driverLicenseFile?.[0];
    dto.nationalIdFile = files?.nationalIdFile?.[0];

    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_CREATE_GUEST, {
      headers: { authorization: authHeader },
      body: dto,
    });
  }

  @All('chapa-callback')
  async chapaCallback(@Req() req, @Body() dto: any) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.CHAPA_CALL_BACK, {
      headers: { authorization: authHeader },

      ...dto,
    });
  }
  @Patch(':id')
  async updateBooking(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Delete(':id')
  async deleteBooking(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_DELETE, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('my')
  async getMyBookings(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_GET_ALL_MY, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get(':id')
  async getBookingById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_GET_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('/code/:code')
  async getBookingByCode(@Req() req, @Param('code') code: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_GET_BY_CODE, {
      headers: { authorization: authHeader },
      code,
    });
  }

  @Get()
  async getAllBookings(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.BOOKING_GET_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }
}
