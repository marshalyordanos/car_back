import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis/redis.constants';

@WebSocketGateway({
  cors: {
    origin: '*', // or put your Expo device IP if needed
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'], // force WebSocket only (no polling)
})
export class NotifyHubGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
    this.initRedisSubscriptions();
  }

  handleConnection(client: Socket) {
    console.log('---------------------------------00000000000000000000000');
    client.on('register', (userId: string) => {
      console.log('))))))))))))))))))))))))))): ', userId);
      client.join(`user_${userId}`);
      client.data.userId = userId;
      this.connectedUsers.set(userId, client);
      console.log(`User ${userId} joined room: user_${userId}`);
    });

    client.on('join_booking', (bookingId: string) => {
      client.join(`booking_${bookingId}`);
      console.log(
        `Socket ${client.id} joined booking room: booking_${bookingId}`,
      );
    });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) this.connectedUsers.delete(userId);
    console.log('Client disconnected:', client.id);
  }

  private async initRedisSubscriptions() {
    console.log(' process.env.REDIS_URL,', process.env.REDIS_URL);
    const subscriber = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
    );
    await subscriber.subscribe('notifications');
    await subscriber.subscribe('chat_messages');
    await subscriber.subscribe('chat_list_updates');
    await subscriber.subscribe('for_all');

    subscriber.on('message', (channel, message) => {
      const parsed = JSON.parse(message);
      if (channel === 'notifications') {
        const { userId, notification } = parsed;

        // Emit directly to the connected socket room for this user
        this.server.to(`user_${userId}`).emit('new_notification', notification);

        // Optional: log or handle offline users
        if (!this.connectedUsers.has(userId)) {
          console.log(
            `User ${userId} not connected; notification stored for later.`,
          );
          // Here you could also persist it in DB for later retrieval
        } else {
          console.log(
            `Notification sent in real-time to user_${userId}:`,
            notification,
          );
        }
      }
      if (channel === 'chat_messages') {
        const { bookingId, message: chatMessage } = parsed;
        this.server.to(`booking_${bookingId}`).emit('new_message', chatMessage);
      }

      if (channel === 'chat_list_updates') {
        const { userIds, chatPreview } = parsed;
        console.log('chat_list_updates: ', userIds, chatPreview);
        userIds.forEach((id: string) =>
          this.server.to(`user_${id}`).emit('update_chat_list', chatPreview),
        );
      }

      console.log('sendToAllchannel: ', channel);

      if (channel === 'for_all') {
        this.server.emit(parsed.event, parsed.payload);
      }
    });
  }

  // ======== PUBLISHER EXAMPLE ==========
  async sendToAll(event: string, payload: any) {
    console.log('sendToAll: ');
    await this.redisClient.publish(
      'for_all',
      JSON.stringify({ event, payload }),
    );
  }
}
