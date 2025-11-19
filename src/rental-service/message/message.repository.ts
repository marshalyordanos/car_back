import { Inject, Injectable } from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../notify-hub/redis/redis.constants';
import { Redis } from 'ioredis';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // Create message (maps DTO -> relation connects)
  async createMessage(data: {
    bookingId: string;
    senderId: string;
    receiverId: string;
    content: string;
    // attachments?: string[];
  }): Promise<Message> {
    console.log('marshal: ', data);
    const [message, unreadCount] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          booking: { connect: { id: data.bookingId } },
          sender: { connect: { id: data.senderId } },
          receiver: { connect: { id: data.receiverId } },
          content: data.content,
        },
        include: { sender: true },
      }),
      this.prisma.message.count({
        where: {
          bookingId: data.bookingId,
          receiverId: data.receiverId,
          isRead: false,
        },
      }),
    ]);
    // 2️ Publish real-time chat message via Redis
    await this.redis.publish(
      'chat_messages',
      JSON.stringify({
        bookingId: data.bookingId,
        message, // you can trim fields if needed
      }),
    );

    // 3 Update chat list for both participants (trigger client refresh)
    const chatPreview = {
      bookingId: data.bookingId,
      lastMessage: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
      },
      withUser: {
        id: message.sender.id,
        fullName: message.sender.firstName + ' ' + message.sender.lastName,
        profilePhoto: message.sender.profilePhoto,
      },
      unreadCount: unreadCount, // client can recalc if necessary
    };

    await this.redis.publish(
      'chat_list_updates',
      JSON.stringify({
        userIds: [data.receiverId],
        chatPreview,
      }),
    );

    return message;
  }

  // Find messages by booking (paginated)
  async findMessagesByBooking(
    bookingId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ data: Message[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' }, // ascending so chat shows from start -> end
        skip,
        take: pageSize,
      }),
      this.prisma.message.count({ where: { bookingId } }),
    ]);
    return { data, total };
  }

  // Get single message
  async findById(id: string) {
    return this.prisma.message.findUnique({ where: { id } });
  }

  // Mark messages as read for a booking where receiver == userId and isRead == false
  async markMessagesAsRead(bookingId: string, userId: string) {
    return this.prisma.message.updateMany({
      where: { bookingId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  // Count unread messages for a user overall or per booking
  async countUnreadForUser(userId: string, bookingId?: string) {
    const where: any = { receiverId: userId, isRead: false };
    if (bookingId) where.bookingId = bookingId;
    return this.prisma.message.count({ where });
  }

  async getChatListForUser(userId: string, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT
        b.id AS "bookingId",
        b."hostId",
        b."guestId",
        b."status" AS "bookingStatus",
        m.id AS "messageId",
        m.content,
        m."createdAt" AS "lastMessageAt",
        COALESCE(u.unread_count, 0) AS "unreadCount",
        CASE
          WHEN b."hostId" = $1 THEN b."guestId"
          ELSE b."hostId"
        END AS "withUserId"
      FROM "Booking" b
      -- JOIN PAYMENT (filter to completed payments only)
      LEFT JOIN "Payment" p ON p."bookingId" = b.id
      -- Last message
      LEFT JOIN LATERAL (
        SELECT *
        FROM "Message"
        WHERE "bookingId" = b.id
        ORDER BY "createdAt" DESC
        LIMIT 1
      ) m ON true
      -- Unread count
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS unread_count
        FROM "Message"
        WHERE "bookingId" = b.id 
          AND "receiverId" = $1 
          AND "isRead" = false
      ) u ON true
      WHERE 
        (b."hostId" = $1 OR b."guestId" = $1)
        AND b."status" != 'PENDING'
        AND p."status" = 'COMPLETED'
      ORDER BY COALESCE(m."createdAt", b."createdAt") DESC
      LIMIT $2 OFFSET $3  
      `,
      userId,
      pageSize,
      offset,
    );

    if (!rows.length) return { items: [], total: 0 };

    const userIds = Array.from(new Set(rows.map((r) => r.withUserId)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, profilePhoto: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const items = rows.map((r) => {
      const u = userMap[r.withUserId];
      return {
        bookingId: r.bookingId,
        bookingStatus: r.bookingStatus,
        lastMessage: r.messageId
          ? { id: r.messageId, content: r.content, createdAt: r.lastMessageAt }
          : null,
        unreadCount: Number(r.unreadCount),
        withUser: u
          ? {
              id: u.id,
              fullName: `${u.firstName} ${u.lastName}`,
              profilePhoto: u.profilePhoto,
            }
          : null,
      };
    });

    // ---- COUNT QUERY WITH SAME CONDITIONS ----
    const [{ count }] = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
      `
      SELECT COUNT(*)::int AS count
      FROM "Booking" b
      LEFT JOIN "Payment" p ON p."bookingId" = b.id
      WHERE 
        (b."hostId" = $1 OR b."guestId" = $1)
        AND b."status" != 'PENDING'
        AND p."status" = 'COMPLETED'
      `,
      userId,
    );

    return { items, total: Number(count) };
  }

  // async getChatListForUser(userId: string, page = 1, pageSize = 10) {
  //   const offset = (page - 1) * pageSize;

  //   const rows = await this.prisma.$queryRawUnsafe<any[]>(
  //     `
  //     SELECT
  //       b.id AS "bookingId",
  //       b."hostId",
  //       b."guestId",
  //       b."status" AS "bookingStatus",
  //       m.id AS "messageId",
  //       m.content,
  //       m."createdAt" AS "lastMessageAt",
  //       COALESCE(u.unread_count, 0) AS "unreadCount",
  //       CASE
  //         WHEN b."hostId" = $1 THEN b."guestId"
  //         ELSE b."hostId"
  //       END AS "withUserId"
  //     FROM "Booking" b
  //     LEFT JOIN LATERAL (
  //       SELECT *
  //       FROM "Message"
  //       WHERE "bookingId" = b.id
  //       ORDER BY "createdAt" DESC
  //       LIMIT 1
  //     ) m ON true
  //     LEFT JOIN LATERAL (
  //       SELECT COUNT(*) AS unread_count
  //       FROM "Message"
  //       WHERE "bookingId" = b.id AND "receiverId" = $1 AND "isRead" = false
  //     ) u ON true
  //     WHERE b."hostId" = $1 OR b."guestId" = $1
  //     ORDER BY COALESCE(m."createdAt", b."createdAt") DESC
  //     LIMIT $2 OFFSET $3
  //     `,
  //     userId,
  //     pageSize,
  //     offset,
  //   );

  //   if (!rows.length) return { items: [], total: 0 };

  //   const userIds = Array.from(new Set(rows.map((r) => r.withUserId)));
  //   const users = await this.prisma.user.findMany({
  //     where: { id: { in: userIds } },
  //     select: { id: true, firstName: true, lastName: true, profilePhoto: true },
  //   });
  //   const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  //   const items = rows.map((r) => {
  //     const u = userMap[r.withUserId];
  //     return {
  //       bookingId: r.bookingId,
  //       bookingStatus: r.bookingStatus, // Include booking status
  //       lastMessage: r.messageId
  //         ? { id: r.messageId, content: r.content, createdAt: r.lastMessageAt }
  //         : null,
  //       unreadCount: Number(r.unreadCount),
  //       withUser: u
  //         ? {
  //             id: u.id,
  //             fullName: `${u.firstName} ${u.lastName}`,
  //             profilePhoto: u.profilePhoto,
  //           }
  //         : null,
  //     };
  //   });

  //   const [{ count }] = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
  //     `SELECT COUNT(*)::int AS count FROM "Booking" WHERE "hostId" = $1 OR "guestId" = $1`,
  //     userId,
  //   );

  //   return { items, total: Number(count) };
  // }

  async isUserPartOfBooking(
    userId: string,
    bookingId: string,
  ): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { hostId: true, guestId: true },
    });
    if (!booking) return false;
    return booking.hostId === userId || booking.guestId === userId;
  }

  async getBookingStatus(bookingId: string): Promise<string | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });
    return booking?.status ?? null;
  }

  async getNotificationsForUser(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total };
  }

  async getNotificationById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        booking: true,
        payment: true,
        dispute: true,
        user: true,
      },
    });
  }

  // async markNotificationAsRead(id: string) {
  //   return this.prisma.notification.update({
  //     where: { id },
  //     data: { isRead: true },
  //   });
  // }

  async markNotificationsAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async countUnreadNotifications(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
