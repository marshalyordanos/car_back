import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Req,
  Get,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PATTERNS } from '../contracts';
import { MicroserviceClientsModule } from './clients.module';
import {
  AuthChangePasswordDto,
  AuthLoginDto,
  AuthRegisterDto,
  AuthRequestPasswordResetDto,
  AuthResetPasswordDto,
  PhoneVerifyDto,
  PhoneVerifyResendDto,
} from '../auth/auth.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
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
  async register(
    @UploadedFiles()
    files: {
      profilePhotoFile?: Express.Multer.File[];
      driverLicenseFile?: Express.Multer.File[];
      nationalIdFile?: Express.Multer.File[];
    },
    @Body() body: AuthRegisterDto,
  ) {
    body.profilePhotoFile = files?.profilePhotoFile?.[0];
    body.driverLicenseFile = files?.driverLicenseFile?.[0];
    body.nationalIdFile = files?.nationalIdFile?.[0];

    return this.authClient.send(PATTERNS.AUTH_REGISTER, body);
  }

  @Post('login')
  async login(@Body() dto: AuthLoginDto) {
    return this.authClient.send(PATTERNS.AUTH_LOGIN, dto);
  }

  @Post('login-admin')
  async loginAdmin(@Body() dto: AuthLoginDto) {
    return this.authClient.send(PATTERNS.AUTH_LOGIN_ADMIN, dto);
  }

  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    return this.authClient.send(
      PATTERNS.AUTH_REFRESH_TOKEN,

      {
        refreshToken: token,
        headers: { authorization: authHeader },
      },
    );
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: AuthChangePasswordDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    console.log('body: ', body);

    return this.authClient.send(PATTERNS.AUTH_CHANGE_PASSWORD, {
      headers: { authorization: authHeader },

      body,
    });
  }

  @Post('verify-phone')
  async verifyPhone(@Req() req: Request, @Body() body: PhoneVerifyDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log('body: ', body);

    return this.authClient.send(PATTERNS.AUTH_PHONE_VERIFY, {
      headers: { authorization: authHeader },

      body,
    });
  }
  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: AuthRequestPasswordResetDto) {
    console.log('Requesting password reset for:', body.phoneNumber);
    return this.authClient.send(PATTERNS.AUTH_REQUEST_PASSWORD_RESET, {
      body,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() body: AuthResetPasswordDto) {
    console.log('Reset password request:', body);
    return this.authClient.send(PATTERNS.AUTH_RESET_PASSWORD, {
      body,
    });
  }

  @Post('phone-resend')
  async verifyPhoneResend(
    @Req() req: Request,
    @Body() body: PhoneVerifyResendDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    console.log('body: ', body);

    return this.authClient.send(PATTERNS.AUTH_PHONE_VERIFY_RESEND, {
      headers: { authorization: authHeader },

      body,
    });
  }

  @Post('superAdmin')
  async superAdmin(@Body() dto: any) {
    return this.authClient.send('SUPPER_ADDMIN', {});
  }
}
