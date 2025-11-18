import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { AuthUseCaseImpl } from './auth.usecase.impl';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthChangePasswordDto,
  PhoneVerifyDto,
  PhoneVerifyResendDto,
  AuthRequestPasswordResetDto,
  AuthResetPasswordDto,
} from './auth.entity';
import { Public } from '../common/decorator/public.decorator';
import { IResponse } from '../common/types';
import { Prisma } from '@prisma/client';
import { getPrismaErrorMessage } from '../common/prismaError';
import { handleCatch } from '../common/handleCatch';

@Controller()
export class AuthMessageController {
  constructor(private readonly usecases: AuthUseCaseImpl) {}

  @Public()
  @MessagePattern(PATTERNS.AUTH_REGISTER)
  async register(@Payload() dto: any) {
    try {
      const user = await this.usecases.register(dto);
      return new IResponse(true, 'User is registered Succuessfuly', null);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_LOGIN)
  async login(@Payload() dto: AuthLoginDto) {
    try {
      console.log('data: ', dto);

      const data = await this.usecases.login(dto);
      return new IResponse(true, 'User is logged in Succuessfuly', data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_LOGIN_ADMIN)
  async loginAdmin(@Payload() dto: AuthLoginDto) {
    try {
      console.log('data: ', dto);

      const data = await this.usecases.loginAdmin(dto);
      return new IResponse(true, 'User is logged in Succuessfuly', data);
    } catch (error) {
      handleCatch(error);
    }
  }
  // @Public()
  @MessagePattern(PATTERNS.AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: any) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user);

      const tokens = await this.usecases.refreshToken(
        user?.sub,
        data.refreshToken,
      );
      return new IResponse(true, 'Token has been refreshed!', tokens);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.AUTH_CHANGE_PASSWORD)
  async changePassword(
    @Payload() data: { user: any; body: AuthChangePasswordDto },
  ) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user, data.body);
      await this.usecases.changePassword(user?.sub, data.body);
      return new IResponse(true, 'Password changed successfully');
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_REQUEST_PASSWORD_RESET)
  async requestPasswordReset(
    @Payload() data: { body: AuthRequestPasswordResetDto },
  ) {
    const res = await this.usecases.requestPasswordReset(data.body);

    return new IResponse(true, 'OTP sent successfully');
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_RESET_PASSWORD)
  async resetPassword(@Payload() data: { body: AuthResetPasswordDto }) {
    const res = await this.usecases.resetPassword(data.body);

    return new IResponse(true, 'Password reset successfully');
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_PHONE_VERIFY)
  async verifyPhone(@Payload() data: { user: any; body: PhoneVerifyDto }) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user, data.body);
      await this.usecases.verifyPhone(data.body.otp, data.body.phone);
      return new IResponse(true, 'Phone Number is verified successfully');
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.AUTH_PHONE_VERIFY_RESEND)
  async verifyPhoneResend(
    @Payload() data: { user: any; body: PhoneVerifyResendDto },
  ) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user, data.body);
      await this.usecases.verifyPhoneResend(data.body.phone);
      return new IResponse(true, 'resned code is sent successfully');
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern('SUPPER_ADDMIN')
  async superAdmin(@Payload() dto: any) {
    try {
      const user = await this.usecases.createSuperAdmin();
      return new IResponse(true, 'User is registered Succuessfuly', user);
    } catch (error) {
      handleCatch(error);
    }
  }
}
//
