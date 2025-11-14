import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { MessageUseCasesImp } from './message.usecase.impl';
import { SendMessageDto, MarkAsReadDto } from './message.entity';
import { PATTERNS } from '../../contracts';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller()
export class MessageMessageController {
  constructor(private readonly usecases: MessageUseCasesImp) {}

  @MessagePattern(PATTERNS.MESSAGE_SEND)
  async send(@Payload() payload: { data: SendMessageDto }) {
    try {
      console.log('pppppppppppppppppppppppooooooooooooooooooo11111:');

      const message = await this.usecases.sendMessage(payload.data);

      return IResponse.success('Message sent', message);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.MESSAGE_FIND_BY_BOOKING)
  async findByBooking(
    @Payload() payload: { bookingId: string; query?: ListQueryDto },
  ) {
    try {
      const result = await this.usecases.listMessagesByBooking(
        payload.bookingId,
        payload.query || {},
      );
      return IResponse.success('Messages fetched', result.data, {
        total: result.total,
        page: payload.query?.page || 1,
        pageSize: payload.query?.pageSize || 50,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.MESSAGE_LIST_CHAT_FOR_USER)
  async listChatForUser(
    @Payload() payload: { userId: string; query?: ListQueryDto },
  ) {
    try {
      const result = await this.usecases.listChatForUser(
        payload.userId,
        payload.query || {},
      );
      return IResponse.success('Chat list fetched', result.items, {
        total: result.total,
        page: payload.query?.page || 1,
        pageSize: payload.query?.pageSize || 50,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.MESSAGE_MARK_AS_READ)
  async markAsRead(@Payload() payload: { data: MarkAsReadDto }) {
    try {
      const res = await this.usecases.markAsRead(payload.data);
      return IResponse.success('Marked as read', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.MESSAGE_UNREAD_COUNT)
  async unreadCount(
    @Payload() payload: { userId: string; bookingId?: string },
  ) {
    try {
      const res = await this.usecases.unreadCount(
        payload.userId,
        payload.bookingId,
      );
      return IResponse.success('Unread count', res);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.MESSAGE_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const d = await this.usecases['repo'].findById(payload.id); // quick access to repo if needed or add usecase method
      return IResponse.success('Message fetched', d);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern('NOTIFICATION_LIST_FOR_USER')
  async listNotifications(
    @Payload() payload: { userId: string; page?: number; pageSize?: number },
  ) {
    try {
      const result = await this.usecases.getNotificationsForUser(
        payload.userId,
        payload.page || 1,
        payload.pageSize || 20,
      );
      return IResponse.success('Notifications fetched', result.notifications, {
        total: result.total,
        page: payload.page || 1,
        pageSize: payload.pageSize || 20,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern('NOTIFICATION_GET_BY_ID')
  async getNotification(@Payload() payload: { id: string }) {
    try {
      const notification = await this.usecases.getNotificationById(payload.id);
      return IResponse.success('Notification fetched', notification);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern('NOTIFICATION_MARK_AS_READ')
  async markNotificationRead(@Payload() payload: { id: string }) {
    try {
      const notification = await this.usecases.markNotificationAsRead(
        payload.id,
      );
      return IResponse.success('Notification marked as read', notification);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern('NOTIFICATION_UNREAD_COUNT')
  async unreadNotificationCount(@Payload() payload: { userId: string }) {
    try {
      const res = await this.usecases.unreadNotificationCount(payload.userId);
      return IResponse.success('Unread notification count', res);
    } catch (error) {
      handleCatch(error);
    }
  }
}
