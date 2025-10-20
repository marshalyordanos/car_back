import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateReviewDto,
  DeleteReviewDto,
} from '../rental-service/review/review.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewGatewayController {
  constructor(
    @Inject('RENTAL_SERVICE') private readonly reviewClient: ClientProxy,
  ) {}

  @Post()
  async createReview(@Req() req, @Body() dto: CreateReviewDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.reviewClient.send(PATTERNS.REVIEW_CREATE, {
      headers: { authorization: authHeader },
      ...dto,
    });
  }

  @Get(':id')
  async getReviewById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.reviewClient.send(PATTERNS.REVIEW_GET_BY_ID, {
      headers: { authorization: authHeader },
      id,
    });
  }

  @Get('car/:carId')
  async getReviewsForCar(@Req() req, @Param('carId') carId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.reviewClient.send(PATTERNS.REVIEW_GET_BY_CAR, {
      headers: { authorization: authHeader },
      carId,
    });
  }

  @Get('user/:userId')
  async getReviewsForUser(@Req() req, @Param('userId') userId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.reviewClient.send(PATTERNS.REVIEW_GET_BY_USER, {
      headers: { authorization: authHeader },
      userId,
    });
  }

  @Delete(':id')
  async deleteReview(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.reviewClient.send(PATTERNS.REVIEW_DELETE, {
      headers: { authorization: authHeader },
      reviewId: id,
    });
  }
}
