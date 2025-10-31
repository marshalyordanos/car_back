import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ListQueryDto } from '../common/query/query.dto';
import { PATTERNS } from '../contracts';
import {
  MarkAsReadDto,
  SendMessageDto,
} from '../rental-service/message/message.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@Controller('messages')
export class MessageGatewayController {
  constructor(@Inject('RENTAL_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    console.log('pppppppppppppppppppppppooooooooooooooooooo:');
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.MESSAGE_SEND, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Get('booking/:bookingId')
  async listByBooking(
    @Req() req,
    @Param('bookingId') bookingId: string,
    @Query() query: ListQueryDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.MESSAGE_FIND_BY_BOOKING, {
      bookingId,
      query,
      headers: { authorization: authHeader },
    });
  }

  @Get('chats/user/:userId')
  async chatList(
    @Req() req,
    @Param('userId') userId: string,
    @Query() query: ListQueryDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.MESSAGE_LIST_CHAT_FOR_USER, {
      userId,
      query,
      headers: { authorization: authHeader },
    });
  }

  @Post('mark-as-read')
  async markAsRead(@Req() req, @Body() dto: MarkAsReadDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.MESSAGE_MARK_AS_READ, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Get('unread-count/:userId')
  async unreadCount(
    @Req() req,
    @Param('userId') userId: string,
    @Query('bookingId') bookingId?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send(PATTERNS.MESSAGE_UNREAD_COUNT, {
      userId,
      bookingId,
      headers: { authorization: authHeader },
    });
  }

  @Get('notifications/:userId')
  async listNotifications(
    @Req() req,
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send('NOTIFICATION_LIST_FOR_USER', {
      userId,
      page,
      pageSize,
      headers: { authorization: authHeader },
    });
  }

  @Get('notifications/id/:id')
  async getNotificationById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send('NOTIFICATION_GET_BY_ID', {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Post('notifications/mark-as-read/:id')
  async markNotificationAsRead(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send('NOTIFICATION_MARK_AS_READ', {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Get('notifications/unread-count/:userId')
  async unreadNotificationCount(@Req() req, @Param('userId') userId: string) {
    const authHeader = req.headers['authorization'] || null;
    return this.client.send('NOTIFICATION_UNREAD_COUNT', {
      userId,
      headers: { authorization: authHeader },
    });
  }
}
