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
} from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { IResponse } from '../common/types';
import cloudinary from '../config/cloudinary/cloudinary.config';
import { uploadToCloudinary } from '../config/cloudinary/upload';

@Injectable()
export class AuthUseCaseImpl {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: AuthRegisterDto): Promise<any> {
    const roleId = data.role;
    if (!roleId) {
      throw new RpcException(`Invalid role`);
    }
    const role = await this.authRepository.findRoleById(roleId!);
    if (!role) {
      throw new RpcException(`Invalid role`);
    }
    const exists = await this.authRepository.findByPhone(data.phone);
    if (exists) {
      throw new RpcException('Phone already in use');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const uploadedFiles: any = {};
    try {
      if (data.profilePhotoFile) {
        console.log('profilePhotoFile: ', data.profilePhotoFile);
        uploadedFiles.profilePhoto = await uploadToCloudinary(
          data.profilePhotoFile,
          'users/profilePhotos',
        );
        console.log('uploadedFiles: ', uploadedFiles);
      }
      if (data.driverLicenseFile && role.name == 'GUEST') {
        uploadedFiles.driverLicenseId = await uploadToCloudinary(
          data.driverLicenseFile,
          'users/driverLicenses',
        );
      }
      if (data.nationalIdFile && role.name == 'GUEST') {
        uploadedFiles.nationalId = await uploadToCloudinary(
          data.nationalIdFile,
          'users/nationalIds',
        );
      }
    } catch (err) {
      throw new RpcException('Error uploading files to Cloudinary');
    }
    if (role.name == 'GUEST') {
      return this.authRepository.createGust(
        data,
        hashedPassword,
        uploadedFiles,
      );
    } else {
      return this.authRepository.createUser(
        data,
        hashedPassword,
        uploadedFiles,
      );
    }
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

    const tokens = await this.generateTokens(user);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
    // delete user.password;

    return { user, tokens };
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    await this.authRepository.removeRefreshToken(userId, sessionId);
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
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

    return tokens;
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

  // async forgotPassword(data: AuthForgotPasswordDto): Promise<void> {
  //   const user = await this.authRepository.findByEmail(data.email);
  //   if (!user) return; // silently ignore

  //   // Generate password reset token
  //   const resetToken = await this.authRepository.generateResetToken(user.id);

  //   // Send email
  //   await this.authRepository.sendResetPasswordEmail(user.email, resetToken);
  // }

  // async resetPassword(data: AuthResetPasswordDto): Promise<void> {
  //   const userId = await this.authRepository.verifyResetToken(data.token);
  //   if (!userId) throw new RpcException('Invalid or expired token');

  //   const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  //   await this.authRepository.updatePassword(userId, hashedPassword);

  //   await this.authRepository.invalidateResetToken(data.token);
  // }

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

  // ----------------- Helper -----------------
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async createSuperAdmin() {
    const user = await this.authRepository.createSuperAdmin();
  }
}
