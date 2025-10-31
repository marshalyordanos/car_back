import { Injectable } from '@nestjs/common';
import { DisputeRepository } from './dispute.repository';
import { CreateDisputeDto, DisputeResolveDto } from './dispute.entity';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';

@Injectable()
export class DisputeUseCasesImpl {
  constructor(private readonly repo: DisputeRepository) {}

  async getDisputeById(id: string) {
    return this.repo.findById(id);
  }

  async getDisputesByUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  // Create dispute rules:
  // - Only one dispute per booking
  // - DROP-OFF inspection must exist and NOT be approved
  // - Either guest or host can create (no extra role check here; assume auth earlier)
  async createDispute(dto: CreateDisputeDto) {
    // check booking exists & payment
    const booking = await this.repo.findBookingWithPayment(dto.bookingId);
    if (!booking) {
      throw new RpcException({ statusCode: 404, message: 'Booking not found' });
    }

    // Only one dispute per booking
    const existing = await this.repo.findDisputeByBookingId(dto.bookingId);
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: 'A dispute already exists for this booking',
      });
    }

    // Check dropoff inspection exists and is NOT approved
    const dropoff = await this.repo.findInspectionByBookingAndType(
      dto.bookingId,
      'DROPOFF',
    );
    if (dropoff) {
      // throw new RpcException({
      //   statusCode: 400,
      //   message: 'Drop-off inspection not found',
      // });

      if (dropoff.approved) {
        throw new RpcException({
          statusCode: 400,
          message:
            'Cannot create dispute: drop-off inspection is already approved',
        });
      }
    }
    // Build dispute create payload (business logic can enrich data if needed)
    const payload = {
      bookingId: dto.bookingId,
      paymentId: dto.paymentId ?? booking.payment?.id,
      userId: dto.userId,
      reason: dto.reason,
      photos: dto.photos ?? [],
      status: 'OPEN',
    };

    // Let repository handle transaction: create dispute + put payment on hold + create HOLD transaction
    return this.repo.createDisputeAndHoldPayment(payload);
  }

  async getAllDisputes(query: ListQueryDto) {
    return this.repo.findAll(query);
  }

  // Admin marks under review (simple status update)
  async markUnderReview(id: string) {
    const dispute = await this.repo.findById(id);
    if (!dispute)
      throw new RpcException({ statusCode: 404, message: 'Dispute not found' });
    return this.repo.updateStatus(id, 'UNDER_REVIEW');
  }

  // Admin resolves: refundAmount may be 0 (means resolved in favor of host)
  async resolveDispute(id: string, dto: DisputeResolveDto) {
    const dispute = await this.repo.findById(id);
    if (!dispute)
      throw new RpcException({ statusCode: 404, message: 'Dispute not found' });

    // If refundAmount > 0 -> process refund
    return this.repo.resolveDisputeWithOptionalRefund({
      disputeId: id,
      adminId: dto.adminId,
      refundAmount: dto.refundAmount ?? 0,
      notes: dto.notes,
    });
  }

  // Admin rejects: mark dispute rejected and unfreeze payment (release hold) without refund
  async rejectDispute(id: string, adminId: string) {
    const dispute = await this.repo.findById(id);
    if (!dispute)
      throw new RpcException({ statusCode: 404, message: 'Dispute not found' });
    return this.repo.rejectDisputeAndReleasePayment(id, adminId);
  }
}
