import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleCatch } from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { ReviewUseCasesImpl } from './review.usecase.impl';
import { Public } from '../../common/decorator/public.decorator';

@Controller()
export class ReviewMessageController {
  constructor(private readonly usecases: ReviewUseCasesImpl) {}

  @MessagePattern(PATTERNS.REVIEW_CREATE)
  async create(@Payload() payload) {
    try {
      const res = await this.usecases.createReview(payload);
      return IResponse.success('Review created successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.REVIEW_GET_BY_ID)
  async getById(@Payload() payload: { id: string }) {
    try {
      const res = await this.usecases.getReviewById(payload.id);
      return IResponse.success('Review fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.REVIEW_GET_BY_CAR)
  async getByCar(@Payload() payload: { carId: string }) {
    try {
      const res = await this.usecases.getReviewsForCar(payload.carId);
      return IResponse.success('Car reviews fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.REVIEW_GET_BY_USER)
  async getByUser(@Payload() payload: { userId: string }) {
    try {
      const res = await this.usecases.getReviewsForUser(payload.userId);
      return IResponse.success('User reviews fetched successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.REVIEW_DELETE)
  async delete(@Payload() payload: { reviewId: string }) {
    try {
      const res = await this.usecases.deleteReview(payload.reviewId);
      return IResponse.success('Review deleted successfully', res);
    } catch (error) {
      return handleCatch(error);
    }
  }
}
