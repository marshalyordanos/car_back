import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { DisputeUseCasesImpl } from './dispute.usecase.impl';

@Controller()
export class DisputeMessageController {
  constructor(private readonly usecases: DisputeUseCasesImpl) {}

  @MessagePattern(PATTERNS.DISPUTE_CREATE)
  async create(@Payload() payload) {
    try {
      const res = await this.usecases.createDispute(payload);
      return IResponse.success('Dispute created successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DISPUTE_GET_BY_ID)
  async getById(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.getDisputeById(payload.id);
      return IResponse.success('Dispute fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DISPUTE_GET_BY_USER)
  async getByUser(@Payload() payload: { userId: string }) {
    try {
      const res = await this.usecases.getDisputesByUser(payload.userId);
      return IResponse.success('User disputes fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DISPUTE_GET_ALL)
  async getAll() {
    try {
      const res = await this.usecases.getAllDisputes();
      return IResponse.success('All disputes fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DISPUTE_RESOLVE)
  async resolve(@Payload() payload: { disputeId: string }) {
    try {
      const res = await this.usecases.updateStatus(
        payload.disputeId,
        'RESOLVED',
      );
      return IResponse.success('Dispute resolved successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.DISPUTE_REJECT)
  async reject(@Payload() payload: { disputeId: string }) {
    try {
      const res = await this.usecases.updateStatus(
        payload.disputeId,
        'REJECTED',
      );
      return IResponse.success('Dispute rejected successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }
}
