import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './review.entity';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewUseCasesImpl {
  constructor(private readonly repo: ReviewRepository) {}

  async createReview(dto: CreateReviewDto) {
    return this.repo.create(dto);
  }

  async getReviewById(id: string) {
    return this.repo.findById(id);
  }

  async getReviewsForCar(carId: string) {
    return this.repo.findByCar(carId);
  }

  async getReviewsForUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async deleteReview(reviewId: string) {
    return this.repo.delete(reviewId);
  }
}
