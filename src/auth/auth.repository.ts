// auth.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path to your Prisma service
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AuthRegisterDto } from './auth.entity';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------- User Queries -----------------
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }
  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      include: { role: true, guestProfile: true, hostProfile: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findRoleById(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }
  async createGust(
    data: AuthRegisterDto,
    hashedPassword: string,
    files?: {
      profilePhoto?: string;
      driverLicenseId?: string;
      nationalId?: string;
    },
  ): Promise<User> {
    const { firstName, lastName, email, phone, role } = data;

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        profilePhoto: files?.profilePhoto,
        guestProfile: {
          create: {
            driverLicenseId: files?.driverLicenseId,
            nationalId: files?.nationalId,
          },
        },
        role: role ? { connect: { id: role } } : undefined,
      },
      include: { role: true, guestProfile: true },
    });
  }
  async createUser(
    data: AuthRegisterDto,
    hashedPassword: string,
    files?: {
      profilePhoto?: string;
    },
  ): Promise<User> {
    const { firstName, lastName, email, phone, role } = data;

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        profilePhoto: files?.profilePhoto || undefined,
        role: role ? { connect: { id: role } } : undefined,
      },
      include: { role: true, guestProfile: true, hostProfile: true },
    });
  }

  // ----------------- Refresh Tokens -----------------
  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 10);
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
      },
    });
  }

  async findSessionByRefreshToken(userId: string, token: string) {
    // Fetch only this user's sessions that are still valid
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() }, // only not expired
      },
    });

    for (const session of sessions) {
      const isValid = await bcrypt.compare(token, session.token);
      if (isValid) return session;
    }

    return null; // no valid session found
  }

  async removeRefreshToken(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.prisma.refreshToken.delete({ where: { id: sessionId } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  async updateRefreshToken(
    userId: string,
    newToken: string,
    sessionId: string,
  ) {
    const hashedToken = await bcrypt.hash(newToken, 10);
    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { token: hashedToken, createdAt: new Date() },
    });
  }

  // ----------------- Password Management -----------------
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async generateResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    return token;
  }

  // async verifyResetToken(token: string): Promise<string | null> {
  //   const resetRecord = await this.prisma.passwordReset.findFirst({
  //     where: {
  //       expiresAt: { gt: new Date() },
  //     },
  //     orderBy: { createdAt: 'desc' },
  //   });
  //   if (!resetRecord) return null;
  //   return resetRecord.userId;
  // }

  // async invalidateResetToken(token: string): Promise<void> {
  //   await this.prisma.passwordReset.deleteMany({
  //     where: { expiresAt: { gt: new Date() } },
  //   });
  // }

  // // ----------------- Email Verification -----------------
  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    // TODO: Integrate real email sending service
    console.log(`Send verification email to ${email} for user ${userId}`);
  }
  async sendVerificationPhone(userId: string, email: string): Promise<void> {
    // TODO: Integrate real email sending service
    console.log(`Send verification email to ${email} for user ${userId}`);
  }

  async verifyEmailToken(token: string): Promise<string | null> {
    // TODO: Implement proper token verification logic
    // For now, return a userId placeholder
    return null;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    // await this.prisma.user.update({
    //   where: { id: userId },
    //   data: { emailVerified: true },
    // });
  }

  // ----------------- Reset Password Email -----------------

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    // TODO: Integrate real email service
    console.log(`Send password reset email to ${email}: token=${token}`);
  }

  async createSuperAdmin() {
    // Check if super admin already exists
    const existing = await this.prisma.user.findFirst({
      where: { isSuperAdmin: true },
    });
    if (existing) {
      return existing;
    }

    const hashedPassword = await bcrypt.hash('admin1111', 10);

    return this.prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@gmail.com',
        password: hashedPassword,
        phone: '0000000000',
        isSuperAdmin: true,
        role: {
          create: {
            name: 'SuperAdmin',
            description: 'Full access to the system',
          },
        },
      },
    });
  }
}
