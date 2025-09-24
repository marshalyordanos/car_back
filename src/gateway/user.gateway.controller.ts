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
  HostProfileDto,
  HostVerifyDto,
  RemoveFromWishlistDto,
  UserDto,
  UserUpdateDto,
} from '../operations/user/user.entity';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('wish-list/:guestId')
  async addToWishlist(
    @Req() req,
    @Param('guestId') guestId: string,
    @Body() dto: AddToWishlistDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_ADD_WISHLIST, {
      headers: { authorization: authHeader },

      guestId,
      carId: dto.carId,
    });
  }

  @Delete('wish-list/:guestId')
  async removeFromWishlist(
    @Req() req,
    @Param('guestId') guestId: string,
    @Body() dto: RemoveFromWishlistDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_REMOVE_WISHLIST, {
      headers: { authorization: authHeader },

      guestId,
      carId: dto.carId,
    });
  }

  @Get('wish-list/:guestId')
  async getWishlist(@Req() req, @Param('guestId') guestId: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.GUEST_GET_WISHLIST, {
      headers: { authorization: authHeader },
      guestId,
    });
  }

  // user

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
      branchId: branchId ? Number(branchId) : null,
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
