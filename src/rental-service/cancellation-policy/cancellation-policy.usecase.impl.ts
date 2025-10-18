import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CancellationPolicyRepository } from './cancellation-policy.repository';
import {
  CancellationPolicyDto,
  CancellationPolicyUpdateDto,
} from './cancellation-policy.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class CancellationPolicyUseCasesImp {
  constructor(private readonly repo: CancellationPolicyRepository) {}

  async createPolicy(dto: CancellationPolicyDto) {
    return this.repo.createPolicy(dto);
  }

  async getPolicyById(id: string) {
    const policy = await this.repo.findById(id);
    if (!policy)
      throw new RpcException({ statusCode: 404, message: 'Policy not found' });
    return policy;
  }

  async getAllPolicies(query: ListQueryDto) {
    return this.repo.findAll(query);
  }

  async updatePolicy(id: string, dto: CancellationPolicyUpdateDto) {
    return this.repo.updatePolicy(id, dto);
  }

  async deletePolicy(id: string) {
    return this.repo.deletePolicy(id);
  }

  async seedDefaultPolicies() {
    const defaultPolicies: Prisma.CancellationPolicyCreateInput[] = [
      {
        userType: UserRole.GUEST,
        daysBeforeTrip: 7,
        refundPercent: 100,
      },
      {
        userType: UserRole.GUEST,
        daysBeforeTrip: 3,
        refundPercent: 50,
      },
      {
        userType: UserRole.GUEST,
        daysBeforeTrip: 1,
        refundPercent: 20,
      },
      {
        userType: UserRole.HOST,
        daysBeforeTrip: 0,
        refundPercent: 0,
      },
    ];
    return this.repo.seedPolicies(defaultPolicies);
  }
}
