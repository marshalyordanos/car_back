import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { AuthUseCaseImpl } from './auth.usecase.impl';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthChangePasswordDto,
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
      return new IResponse(true, 'User is registered Succuessfuly', user);
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
