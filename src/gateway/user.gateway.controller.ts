import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
  Req,
  Query,
  Logger,
  BadRequestException,
  Search,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AddToWishlistDto,
  CreateHostDto,
  DashboardSummaryDto,
  HostProfileDto,
  HostVerifyDto,
  IsActiveDto,
  RemoveFromWishlistDto,
  UserCreteDto,
  UserDto,
  UserUpdateDto,
} from '../operations/user/user.entity';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { ListQueryDto } from '../common/query/query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('wish-list')
  async addToWishlist(@Req() req, @Body() dto: AddToWishlistDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_ADD_WISHLIST, {
      headers: { authorization: authHeader },

      carId: dto.carId,
    });
  }

  @Delete('wish-list/:carId')
  async removeFromWishlist(@Req() req, @Param('carId') carId: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_REMOVE_WISHLIST, {
      headers: { authorization: authHeader },

      carId: carId,
    });
  }

  @Get('wish-list')
  async getWishlist(@Req() req, @Param('guestId') guestId: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_GET_WISHLIST, {
      headers: { authorization: authHeader },
    });
  }

  // user

  @Get('staffs')
  async findAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('guests')
  async findAllCustomers(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.CUSTOMER_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'profilePhotoFile', maxCount: 1 }],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  @Post('hosts')
  async createHost(
    @UploadedFiles()
    files: {
      profilePhotoFile?: Express.Multer.File[];
    },
    @Body() body: CreateHostDto,
  ) {
    body.profilePhotoFile = files?.profilePhotoFile?.[0];

    return this.usersClient.send(PATTERNS.CREATE_HOST_USER, body);
  }

  @Get('hosts')
  async findAllHosts(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.HOST_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }
  @Patch('host/:id')
  async updateHostProfile(
    @Req() req,
    @Param('id') id: string,
    @Body() data: HostProfileDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_UPDATE_HOST_PROFILE, {
      headers: { authorization: authHeader },
      data: data,
      id,
    });
  }
  @Patch('host-verify/:id')
  async verifyHostProfile(
    @Req() req,
    @Param('id') id: string,
    @Body() data: HostVerifyDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_VERIFY_HOST_PROFILE, {
      headers: { authorization: authHeader },
      id,
      data,
    });
  }

  @Patch('update-active-satus/:id')
  async activeOrDiactiveUser(
    @Req() req,
    @Param('id') id: string,
    @Body() data: IsActiveDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.ACTIVE_DISACTIVE_USER, {
      headers: { authorization: authHeader },
      id,
      data,
    });
  }

  @Get('me/:id')
  async findMe(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_FIND_ME_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('summary')
  async getSummary(@Req() req, @Query() query: DashboardSummaryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.DASHBOARD_SUMMARY, {
      headers: { authorization: authHeader },
      data: query,
    });
  }

  @Patch('me/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhotoFile', maxCount: 1 },
        { name: 'driverLicenseFile', maxCount: 1 },
        { name: 'nationalIdFile', maxCount: 1 },
      ],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  async updateMe(
    @UploadedFiles()
    files: {
      profilePhotoFile?: Express.Multer.File[];
      driverLicenseFile?: Express.Multer.File[];
      nationalIdFile?: Express.Multer.File[];
    },
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UserUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    dto.profilePhotoFile = files?.profilePhotoFile?.[0];
    dto.driverLicenseFile = files?.driverLicenseFile?.[0];
    dto.nationalIdFile = files?.nationalIdFile?.[0];
    return this.usersClient.send(PATTERNS.USER_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhotoFile', maxCount: 1 },
        { name: 'driverLicenseFile', maxCount: 1 },
        { name: 'nationalIdFile', maxCount: 1 },
      ],
      { storage: multer.memoryStorage() }, // file stays in memory
    ),
  )
  async updateUser(
    @UploadedFiles()
    files: {
      profilePhotoFile?: Express.Multer.File[];
      driverLicenseFile?: Express.Multer.File[];
      nationalIdFile?: Express.Multer.File[];
    },
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UserUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    dto.profilePhotoFile = files?.profilePhotoFile?.[0];
    dto.driverLicenseFile = files?.driverLicenseFile?.[0];
    dto.nationalIdFile = files?.nationalIdFile?.[0];

    return this.usersClient.send(PATTERNS.USER_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Post()
  async create(@Req() req, @Body() dto: UserCreteDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_CREATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Get(':id')
  async getUser(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_FIND_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_DELETE, { id });
  }
}
