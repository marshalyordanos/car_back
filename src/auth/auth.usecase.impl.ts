// auth.usecase.impl.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthUseCase } from './auth.usecase';
import { AuthRepository } from './auth.repository';
import { User } from '@prisma/client';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthTokens,
  AuthChangePasswordDto,
  AuthForgotPasswordDto,
  AuthResetPasswordDto,
  AuthVerifyEmailDto,
  AuthMfaDto,
  AuthSession,
  AuthRequestPasswordResetDto,
} from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { IResponse } from '../common/types';
import { uploadToSpaces } from '../config/cloudinary/upload';
import { sendSms } from '../utils/sendSms';
import { randomInt } from 'crypto';

/**
 * Generate a 6-digit numeric OTP as a string (e.g. "012345")
 */
export function generateOtp6(): string {
  const num = randomInt(0, 1_000_000); // 0..999999
  return num.toString().padStart(6, '0');
}
@Injectable()
export class AuthUseCaseImpl {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: AuthRegisterDto): Promise<any> {
    const roleName = data.role;
    if (!roleName) {
      throw new RpcException(`Invalid role`);
    }
    const role = await this.authRepository.findRoleByName(roleName!);
    if (!role) {
      throw new RpcException(`Invalid role`);
    }
    data.role = role.id;
    const exists = await this.authRepository.findByPhone(data.phone);
    if (exists) {
      throw new RpcException('Phone already in use');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const uploadedFiles: any = {};
    try {
      console.log('spacesssssssssssssssssssssss');
      if (data.profilePhotoFile) {
        console.log('profilePhotoFile: ', data.profilePhotoFile);
        uploadedFiles.profilePhoto = await uploadToSpaces(
          data.profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
      if (data.driverLicenseFile && role.name == 'GUEST') {
        uploadedFiles.driverLicenseId = await uploadToSpaces(
          data.driverLicenseFile,
          'users/driverLicenses',
        );
      }
      if (data.nationalIdFile && role.name == 'GUEST') {
        uploadedFiles.nationalId = await uploadToSpaces(
          data.nationalIdFile,
          'users/nationalIds',
        );
      }
    } catch (err) {
      console.log('space error: ', err);
      throw new RpcException('Error uploading files to space');
    }
    const nums = generateOtp6();

    let user;

    if (role.name == 'GUEST') {
      user = await this.authRepository.createGust(
        data,
        hashedPassword,
        uploadedFiles,
        nums,
      );
    } else {
      user = await this.authRepository.createUser(
        data,
        hashedPassword,
        uploadedFiles,
        nums,
      );
    }

    await sendSms(nums, data.phone);

    return user;
  }

  async login(data: AuthLoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.authRepository.findByPhone(data.phone);

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    }

    if (user?.role?.name !== 'GUEST') {
      throw new RpcException({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    }

    if (!user.isVerified) {
      const nums = generateOtp6();

      await sendSms(nums, user.phone!);
      await this.authRepository.changeUserOtp(user.id, nums);
      throw new RpcException({
        statusCode: 400,
        message: 'verify first',
      });
    }
    const tokens = await this.generateTokens(user);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
    // delete user.password;

    return { user, tokens };
  }

  async loginAdmin(
    data: AuthLoginDto,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.authRepository.findByPhone(data.phone);

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    }
    if (user?.role?.name == 'GUEST') {
      throw new RpcException({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    }

    const tokens = await this.generateTokens(user);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
    // delete user.password;

    return { user, tokens };
  }

  async requestPasswordReset(data: AuthRequestPasswordResetDto) {
    const user = await this.authRepository.findByPhone(data.phoneNumber);
    if (!user)
      throw new RpcException('This phone number does not match any account.');

    const nums = generateOtp6();
    await this.authRepository.changeUserOtp(user.id, nums);

    await sendSms(nums, user.phone!);
    return new IResponse(true, 'OTP sent successfully');
  }

  // Step 2: Verify OTP & reset password
  async resetPassword(data: AuthResetPasswordDto) {
    const user = await this.authRepository.findByPhone(data.phoneNumber);
    if (!user) throw new RpcException('User not found');

    if (user.otp !== data.otp) {
      throw new RpcException({
        statusCode: 400,
        message: 'The OTP you entered is incorrect. Please try again.',
      });
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.authRepository.updatePassword(user.id, hashedPassword);

    return new IResponse(true, 'Password reset successfully');
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    await this.authRepository.removeRefreshToken(userId, sessionId);
  }

  async refreshToken(userId: string, refreshToken: string) {
    console.log('tokens: ', refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(
      userId,
      refreshToken,
    );
    console.log('sessions: ', session);
    if (!session) {
      throw new RpcException('Invalid refresh token');
    }

    const user = await this.authRepository.findById(session.userId);
    if (!user) throw new RpcException('User not found');

    const tokens = await this.generateTokens(user);
    await this.authRepository.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      session.id,
    );

    return { user: user, tokens };
  }

  // ----------------- Password Management -----------------
  async changePassword(
    userId: string,
    data: AuthChangePasswordDto,
  ): Promise<any> {
    console.log('-----------------------: ', data, userId);
    const user = await this.authRepository.findById(userId);

    if (!user) throw new RpcException('User not found');

    const isOldPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid)
      throw new RpcException('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.authRepository.updatePassword(userId, hashedPassword);
    // { message: 'Password changed successfully' }; // ✅ return success info
  }

  // ----------------- Email Verification -----------------

  async verifyEmail(data: AuthVerifyEmailDto): Promise<void> {
    const userId = await this.authRepository.verifyEmailToken(data.token);
    if (!userId) throw new RpcException('Invalid verification token');

    await this.authRepository.markEmailAsVerified(userId);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return;

    // if (user.emailVerified) return; // already verified

    await this.authRepository.sendVerificationEmail(user.id, email);
  }

  async verifyPhone(otp: string, phone: string) {
    const user = await this.authRepository.findByPhone(phone);

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: 'Please register again',
      });
    }

    console.log('======================================1', user);

    if (user.otp !== otp) {
      throw new RpcException({
        statusCode: 400,
        message: 'The OTP you entered is incorrect. Please try again.',
      });
    }

    console.log('======================================3', user);

    return this.authRepository.changeUserStatus(user.id);

    // TODO: Integrate real email sending service
    // console.log(`Send verification email to ${emaphoneil} for user ${userId}`);
  }
  async verifyPhoneResend(phone: string) {
    const user = await this.authRepository.findByPhone(phone);

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: 'Please register again',
      });
    }

    const nums = generateOtp6();
    await sendSms(nums, phone);

    return this.authRepository.changeUserOtp(user.id, nums);

    // TODO: Integrate real email sending service
    // console.log(`Send verification email to ${emaphoneil} for user ${userId}`);
  }
  // ----------------- Helper -----------------
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1y' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '3y' });

    return { accessToken, refreshToken };
  }

  async createSuperAdmin() {
    const user = await this.authRepository.createSuperAdmin();
  }
}
