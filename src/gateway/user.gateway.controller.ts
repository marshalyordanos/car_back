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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AddToWishlistDto,
  CreateHostDto,
  DashboardSummaryDto,
  HostProfileDto,
  HostVerifyDto,
  IsActiveDto,
  PlatformFeeDto,
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
import { BankType } from '@prisma/client';
import { uploadToSpaces } from '../config/cloudinary/upload';

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
    const profilePhotoFile = files?.profilePhotoFile?.[0];
    const uploadedFiles: any = {};
    try {
      if (profilePhotoFile) {
        uploadedFiles.profilePhoto = await uploadToSpaces(
          profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
    } catch (err) {
      throw new RpcException(
        err.message || 'Error uploading files to Cloudinary',
      );
    }
    return this.usersClient.send(PATTERNS.CREATE_HOST_USER, {
      body,
      uploadedFiles,
    });
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
    const profilePhotoFile = files?.profilePhotoFile?.[0];
    const driverLicenseFile = files?.driverLicenseFile?.[0];
    const nationalIdFile = files?.nationalIdFile?.[0];
    const uploadedFiles: any = {};
    try {
      if (profilePhotoFile) {
        console.log('profilePhotoFile: ', profilePhotoFile);
        uploadedFiles.profilePhoto = await uploadToSpaces(
          profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
      if (driverLicenseFile) {
        uploadedFiles.driverLicenseId = await uploadToSpaces(
          driverLicenseFile,
          'users/driverLicenses',
        );
      }
      if (nationalIdFile) {
        uploadedFiles.nationalId = await uploadToSpaces(
          nationalIdFile,
          'users/nationalIds',
        );
      }
    } catch (err) {
      throw new RpcException(
        err.message || 'Error uploading files to Cloudinary',
      );
    }
    return this.usersClient.send(PATTERNS.USER_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
      uploadedFiles,
    });
  }

  @Get('host/payout')
  async getHostPayouts(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.PAYOUT_FIND_BY_HOST, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Post('host/withdraw')
  async requestWithdrawal(
    @Req() req,
    @Body() body: { amount: number; accountNumber: string; bankType: BankType },
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.PAYOUT_REQUEST_WITHDRAWAL, {
      headers: { authorization: authHeader },
      amount: body.amount,
      accountNumber: body.accountNumber,
      bankType: body.bankType,
    });
  }

  @Get('host/:payoutId/status')
  async checkStatus(@Param('payoutId') payoutId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.PAYOUT_CHECK_STATUS, {
      headers: { authorization: authHeader },
      payoutId,
    });
  }
  @Patch('host/:payoutId/status')
  async updateStatus(
    @Param('payoutId') payoutId: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; reason?: string },
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.PAYOUT_ADMIN_UPDATE_STATUS, {
      headers: { authorization: authHeader },
      payoutId,
      status: body.status,
      reason: body.reason,
    });
  }
  @Post('admin/setting')
  async createOrUpdate(@Req() req, @Body() dto: PlatformFeeDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.PLATFORM_FEE_CREATE_OR_UPDATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }

  @Get('admin/setting')
  async getFee(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.PLATFORM_FEE_GET, {
      headers: { authorization: authHeader },
    });
  }

  @Post('/delete')
  async deleteAcount(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.DELETE_ACCOUNT, {
      headers: { authorization: authHeader },
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
    const profilePhotoFile = files?.profilePhotoFile?.[0];
    const driverLicenseFile = files?.driverLicenseFile?.[0];
    const nationalIdFile = files?.nationalIdFile?.[0];
    const uploadedFiles: any = {};
    try {
      if (profilePhotoFile) {
        console.log('profilePhotoFile: ', profilePhotoFile);
        uploadedFiles.profilePhoto = await uploadToSpaces(
          profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
      if (driverLicenseFile) {
        uploadedFiles.driverLicenseId = await uploadToSpaces(
          driverLicenseFile,
          'users/driverLicenses',
        );
      }
      if (nationalIdFile) {
        uploadedFiles.nationalId = await uploadToSpaces(
          nationalIdFile,
          'users/nationalIds',
        );
      }
    } catch (err) {
      throw new RpcException(
        err.message || 'Error uploading files to Cloudinary',
      );
    }
    return this.usersClient.send(PATTERNS.USER_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
      uploadedFiles,
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
