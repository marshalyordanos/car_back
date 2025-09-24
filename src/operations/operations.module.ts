import { Module } from '@nestjs/common';
import { UserMessageController } from './user/user.controller';
import { UserUseCasesImp } from './user/user.usecase.impl';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { StaffUseCasesImpl } from './staff/staff.useCase.impl';
import { StaffMessageController } from './staff/staff.controller';
import { StaffRepository } from './staff/staff.repository';
import { AccessControlMessageController } from './acl/access_control.controller';
import { AccessControlUsecaseImpl } from './acl/access_control.usecase.impl';
import { AccessControlRepository } from './acl/access_control.repository';
import { CarModelMessageController } from './car-model/car-model.controller';
import { CarMakeMessageController } from './car-make/car-make.controller';
import { CarModelUseCasesImp } from './car-model/car-model.usecase.impl';
import { CarModelRepository } from './car-model/car-model.repository';
import { CarMakeUseCasesImp } from './car-make/car-make.usecase.impl';
import { CarMakeRepository } from './car-make/car-make.repository';
import { CarMessageController } from './car/car.controller';
import { CarUseCasesImp } from './car/car.usecase.impl';
import { CarRepository } from './car/car.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    UserMessageController,

    StaffMessageController,
    AccessControlMessageController,
    CarModelMessageController,
    CarMakeMessageController,
    CarMessageController,
  ],
  providers: [
    UserUseCasesImp,
    UserRepository,
    PrismaService,

    StaffUseCasesImpl,
    StaffRepository,
    AccessControlUsecaseImpl,
    AccessControlRepository,
    CarModelUseCasesImp,
    CarModelRepository,
    CarMakeUseCasesImp,
    CarMakeRepository,
    CarUseCasesImp,
    CarRepository,
  ],
  exports: [
    UserUseCasesImp,
    StaffUseCasesImpl,
    AccessControlUsecaseImpl,
    CarMakeUseCasesImp,
    CarModelUseCasesImp,
    CarUseCasesImp,
  ],
})
export class OperationsModule {}
