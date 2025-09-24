import { Injectable } from '@nestjs/common';
import { DisputeRepository } from './dispute.repository';
import { CreateDisputeDto } from './dispute.entity';

@Injectable()
export class DisputeUseCasesImpl {
  constructor(private readonly repo: DisputeRepository) {}

  async createDispute(dto: CreateDisputeDto) {
    return this.repo.create(dto);
  }

  async getDisputeById(id: string) {
    return this.repo.findById(id);
  }

  async getDisputesByUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async getAllDisputes() {
    return this.repo.findAll();
  }

  async updateStatus(disputeId: string, status: string) {
    return this.repo.updateStatus(disputeId, status);
  }
}
