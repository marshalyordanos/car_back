import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MessageRepository } from './message.repository';
import { SendMessageDto, MarkAsReadDto } from './message.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { NotifyHubGateway } from '../../notify-hub/notify-hub.gateway';
import { REDIS_CLIENT } from '../../notify-hub/redis/redis.constants';
import { Redis } from 'ioredis';

@Injectable()
export class MessageUseCasesImp {
  constructor(
    private readonly repo: MessageRepository,
    // @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // Send a message: only host or guest allowed (business rule)
  async sendMessage(dto: SendMessageDto) {
    // const status = await this.repo.getBookingStatus(dto.bookingId);
    // if (!status) {
    //   throw new RpcException({
    //     statusCode: 404,
    //     message: 'Booking not found',
    //   });
    // }
    // if (status !== 'CONFIRMED') {
    //   throw new RpcException({
    //     statusCode: 400,
    //     message: 'Messages allowed only on confirmed bookings',
    //   });
    // }

    // // Verify user is part of booking
    // const isPart = await this.repo.isUserPartOfBooking(
    //   dto.senderId,
    //   dto.bookingId,
    // );
    // if (!isPart) {
    //   throw new RpcException({
    //     statusCode: 403,
    //     message: 'Sender is not part of this booking',
    //   });
    // }
    // // Verify receiver is the other party
    // const isReceiverPart = await this.repo.isUserPartOfBooking(
    //   dto.receiverId,
    //   dto.bookingId,
    // );
    // if (!isReceiverPart) {
    //   throw new RpcException({
    //     statusCode: 400,
    //     message: 'Receiver is not part of this booking',
    //   });
    // }
    // // Prevent sending to self unless you want to allow
    // if (dto.senderId === dto.receiverId) {
    //   throw new RpcException({
    //     statusCode: 400,
    //     message: 'Sender and receiver must be different',
    //   });
    // }
    // Create message via repository
    const message = await this.repo.createMessage({
      bookingId: dto.bookingId,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
    });

    // return message (controller will emit event)

    // await this.redis.publish(
    //   'for_all',
    //   JSON.stringify({
    //     event: 'global_alert',
    //     payload: { text: 'Hi all' },
    //   }),
    // );
    return message;
  }

  // List messages in booking with pagination
  async listMessagesByBooking(bookingId: string, query: ListQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    return this.repo.findMessagesByBooking(bookingId, page, pageSize);
  }

  // Chat list for user
  async listChatForUser(userId: string, query: ListQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 3;
    return this.repo.getChatListForUser(userId, page, pageSize);
  }

  // Mark as read
  async markAsRead(dto: MarkAsReadDto) {
    // user must be part of booking
    const isPart = await this.repo.isUserPartOfBooking(
      dto.userId,
      dto.bookingId,
    );
    if (!isPart)
      throw new RpcException({
        statusCode: 403,
        message: 'User not part of booking',
      });

    const res = await this.repo.markMessagesAsRead(dto.bookingId, dto.userId);
    return res;
  }

  // Unread count for a user (across all bookings or a booking)
  async unreadCount(userId: string, bookingId?: string) {
    const count = await this.repo.countUnreadForUser(userId, bookingId);
    return { count };
  }

  async getNotificationsForUser(userId: string, page = 1, pageSize = 20) {
    return this.repo.getNotificationsForUser(userId, page, pageSize);
  }

  // Get a single notification by ID
  async getNotificationById(id: string) {
    return this.repo.getNotificationById(id);
  }

  // Mark notification as read
  async markNotificationAsRead(id: string) {
    return this.repo.markNotificationsAsRead(id);
  }
  async unreadNotificationCount(userId: string) {
    const count = await this.repo.countUnreadNotifications(userId);
    return { count };
  }
}
