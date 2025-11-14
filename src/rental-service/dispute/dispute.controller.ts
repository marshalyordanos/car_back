import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { DisputeUseCasesImpl } from './dispute.usecase.impl';
import { CreateDisputeDto, DisputeResolveDto } from './dispute.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import * as checkPermissionDecorator from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class DisputeMessageController {
  constructor(private readonly usecases: DisputeUseCasesImpl) {}

  @MessagePattern(PATTERNS.DISPUTE_CREATE)
  async create(@Payload() payload: { data: CreateDisputeDto }) {
    try {
      const dispute = await this.usecases.createDispute(payload.data);
      return IResponse.success('Dispute created', dispute);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPUTE_GET_All2)
  async findAll(@Payload() payload: { query: ListQueryDto }) {
    try {
      console.log('ddddddddddddddddddddddddddddddddddddddd');

      const result = await this.usecases.getAllDisputes(payload.query);
      return IResponse.success(
        'Disputes fetched',
        result.models,
        result.pagination,
      );
    } catch (error) {
      console.log('ddddddddddddddddddddddddddddddddddddddd');

      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPUTE_GET_BY_ID)
  async getById(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.getDisputeById(payload.id);
      return IResponse.success('Dispute fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPUTE_GET_BY_USER)
  async getByUser(@Payload() payload: { userId: string }) {
    try {
      const res = await this.usecases.getDisputesByUser(payload.userId);
      return IResponse.success('User disputes fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  // Admin review → mark UNDER_REVIEW
  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPUTE_ADMIN_REVIEW)
  async adminReview(@Payload() payload: { id: string; user: any }) {
    try {
      const dispute = await this.usecases.markUnderReview(
        payload.id,
        payload?.user.sub,
      );
      return IResponse.success('Dispute marked under review', dispute);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Admin resolves with optional refund
  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPUTE_RESOLVE)
  async resolve(
    @Payload() payload: { id: string; data: DisputeResolveDto; user: any },
  ) {
    try {
      const result = await this.usecases.resolveDispute(
        payload.id,
        payload.data,
        payload?.user.sub,
      );
      return IResponse.success('Dispute resolved', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Admin rejects dispute
  @UseGuards(PermissionGuard)
  @checkPermissionDecorator.CheckPermission('DISPUTE', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPUTE_REJECT)
  async reject(@Payload() payload: { id: string; user: any }) {
    try {
      const dispute = await this.usecases.rejectDispute(
        payload.id,
        payload.user?.sub,
      );
      return IResponse.success('Dispute rejected', dispute);
    } catch (error) {
      handleCatch(error);
    }
  }
}
