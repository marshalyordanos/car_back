import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CancellationPolicyUseCasesImp } from './cancellation-policy.usecase.impl';
import {
  CancellationPolicyDto,
  CancellationPolicyUpdateDto,
} from './cancellation-policy.entity';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { PATTERNS } from '../../contracts';
import { Public } from '../../common/decorator/public.decorator';
import { PermissionGuard } from 'src/common/permission.guard';
import { CheckPermission } from 'src/common/decorator/check-permission.decorator';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

@Controller()
export class CancellationPolicyMessageController {
  constructor(private readonly usecases: CancellationPolicyUseCasesImp) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('CANCELLATION POLICY', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CANCELLATION_POLICY_CREATE)
  async create(@Payload() payload: { data: CancellationPolicyDto }) {
    try {
      const policy = await this.usecases.createPolicy(payload.data);
      return IResponse.success('Policy created successfully', policy);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CANCELLATION_POLICY_FIND_ALL)
  async findAll(@Payload() payload: { query: ListQueryDto }) {
    try {
      console.log('----------===========');
      const result = await this.usecases.getAllPolicies(payload.query);
      return IResponse.success(
        'Policies fetched',
        result.models,
        result.pagination,
      );
    } catch (error) {
      console.log('--------------', error);
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.CANCELLATION_POLICY_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const policy = await this.usecases.getPolicyById(payload.id);
      return IResponse.success('Policy fetched', policy);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CANCELLATION POLICY', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CANCELLATION_POLICY_UPDATE)
  async update(
    @Payload() payload: { id: string; data: CancellationPolicyUpdateDto },
  ) {
    try {
      const policy = await this.usecases.updatePolicy(payload.id, payload.data);
      return IResponse.success('Policy updated', policy);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('CANCELLATION POLICY', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CANCELLATION_POLICY_DELETE)
  async delete(@Payload() payload: { id: string }) {
    try {
      const policy = await this.usecases.deletePolicy(payload.id);
      return IResponse.success('Policy deleted', policy);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.CANCELLATION_POLICY_SEED)
  async seed() {
    try {
      const policies = await this.usecases.seedDefaultPolicies();
      return IResponse.success('Default policies seeded', policies);
    } catch (error) {
      handleCatch(error);
    }
  }
}
