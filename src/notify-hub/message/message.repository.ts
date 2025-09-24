import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './message.entity';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        reviewerId: dto.reviewerId,
        revieweeId: dto.revieweeId,
        carId: dto.carId,
        rating: dto.rating,
        comment: dto.comment,
        type: dto.type,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: true,
        reviewee: true,
        car: true,
      },
    });
  }

  async findByCar(carId: string) {
    return this.prisma.review.findMany({
      where: { carId },
      include: { reviewer: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: { reviewer: true },
    });
  }

  async delete(reviewId: string) {
    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
