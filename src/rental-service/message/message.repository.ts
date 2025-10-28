import { Injectable } from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Create message (maps DTO -> relation connects)
  async createMessage(data: {
    bookingId: string;
    senderId: string;
    receiverId: string;
    content: string;
    // attachments?: string[];
  }): Promise<Message> {
    console.log('marshal: ', data);
    return this.prisma.message.create({
      data: {
        booking: { connect: { id: data.bookingId } },
        sender: { connect: { id: data.senderId } },
        receiver: { connect: { id: data.receiverId } },
        content: data.content,
        // isRead defaults to false
      },
    });
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
        orderBy: { createdAt: 'asc' }, // ascending so chat shows from start -> end
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

  // Chat list for a user: return bookings where user is host or guest,
  // with last message and unread count for that booking. Paginated.
  // async getChatListForUser(
  //   userId: string,
  //   page = 1,
  //   pageSize = 20,
  // ): Promise<{
  //   items: Array<{
  //     bookingId: string;
  //     lastMessage?: Message | null;
  //     unreadCount: number;
  //     withUserId: string;
  //     bookingSummary?: any;
  //   }>;
  //   total: number;
  // }> {
  //   const skip = (page - 1) * pageSize;

  //   // Get bookings for user
  //   const [bookings, total] = await Promise.all([
  //     this.prisma.booking.findMany({
  //       where: { OR: [{ hostId: userId }, { guestId: userId }] },
  //       orderBy: { updatedAt: 'desc' },
  //       skip,
  //       take: pageSize,
  //       select: {
  //         id: true,
  //         hostId: true,
  //         guestId: true,
  //         startDate: true,
  //         endDate: true,
  //         status: true,
  //       },
  //     }),
  //     this.prisma.booking.count({
  //       where: { OR: [{ hostId: userId }, { guestId: userId }] },
  //     }),
  //   ]);

  //   if (bookings.length === 0) return { items: [], total };

  //   const bookingIds = bookings.map((b) => b.id);

  //   // Get last message per booking
  //   const lastMessages = await this.prisma.message.findMany({
  //     where: { bookingId: { in: bookingIds } },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   // Reduce to last message per booking
  //   const lastMessageMap = new Map<string, Message>();
  //   for (const msg of lastMessages) {
  //     if (!lastMessageMap.has(msg.bookingId))
  //       lastMessageMap.set(msg.bookingId, msg);
  //   }

  //   // Count unread per booking (without raw SQL, fully Prisma)
  //   const unreadCounts: Record<string, number> = {};
  //   for (const id of bookingIds) {
  //     const count = await this.prisma.message.count({
  //       where: { bookingId: id, receiverId: userId, isRead: false },
  //     });
  //     unreadCounts[id] = count;
  //   }

  //   // Build response
  //   const items = bookings.map((b) => {
  //     const otherUserId = b.hostId === userId ? b.guestId : b.hostId;
  //     return {
  //       bookingId: b.id,
  //       lastMessage: lastMessageMap.get(b.id) || null,
  //       unreadCount: unreadCounts[b.id] || 0,
  //       withUserId: otherUserId,
  //       bookingSummary: b,
  //     };
  //   });

  //   return { items, total };
  // }
  // async getChatListForUser(userId: string, page = 1, pageSize = 20) {
  //   const skip = (page - 1) * pageSize;

  //   // 1) find bookings of this user
  //   const bookings = await this.prisma.booking.findMany({
  //     where: { OR: [{ hostId: userId }, { guestId: userId }] },
  //     orderBy: { updatedAt: 'desc' },
  //     skip,
  //     take: pageSize,
  //     select: {
  //       id: true,
  //       hostId: true,
  //       guestId: true,
  //       startDate: true,
  //       endDate: true,
  //       status: true,
  //     },
  //   });

  //   if (!bookings.length) return { items: [], total: 0 };

  //   const bookingIds = bookings.map((b) => b.id);

  //   // 2) find only bookings that have messages
  //   const messageGroups = await this.prisma.message.groupBy({
  //     by: ['bookingId'],
  //     where: { bookingId: { in: bookingIds } },
  //   });

  //   const validIds = new Set(messageGroups.map((m) => m.bookingId));
  //   const filtered = bookings.filter((b) => validIds.has(b.id));

  //   if (!filtered.length) return { items: [], total: 0 };

  //   const filteredIds = filtered.map((b) => b.id);

  //   // 3) get last messages for these only (fast)
  //   const lastMessagesAll = await this.prisma.message.findMany({
  //     where: { bookingId: { in: filteredIds } },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   const lastMessageMap = new Map<string, Message>();
  //   for (const m of lastMessagesAll) {
  //     if (!lastMessageMap.has(m.bookingId)) {
  //       lastMessageMap.set(m.bookingId, m);
  //     }
  //   }

  //   // 4) unread counts aggregated in one query using groupBy
  //   const unreadCountsRaw = await this.prisma.message.groupBy({
  //     by: ['bookingId'],
  //     where: {
  //       bookingId: { in: filteredIds },
  //       receiverId: userId,
  //       isRead: false,
  //     },
  //     _count: true,
  //   });

  //   const unreadMap = Object.fromEntries(
  //     unreadCountsRaw.map((u) => [u.bookingId, u._count]),
  //   );

  //   // 5) build response
  //   const items = filtered.map((b) => {
  //     const withUserId = b.hostId === userId ? b.guestId : b.hostId;
  //     return {
  //       bookingId: b.id,
  //       lastMessage: lastMessageMap.get(b.id) ?? null,
  //       unreadCount: unreadMap[b.id] ?? 0,
  //       withUserId,
  //       bookingSummary: b,
  //     };
  //   });

  //   return {
  //     items,
  //     total: items.length, // only conversations, not all bookings
  //   };
  // }

  async getChatListForUser(userId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    // STEP 1 — get conversations (booking + last message + unread count)
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      WITH user_bookings AS (
        SELECT id
        FROM "Booking"
        WHERE "hostId" = $1 OR "guestId" = $1
      ),
      last_msg AS (
        SELECT DISTINCT ON ("bookingId")
          "bookingId",
          id          AS "messageId",
          content,
          "createdAt",
          "senderId",
          "receiverId",
          "isRead"
        FROM "Message"
        WHERE "bookingId" IN (SELECT id FROM user_bookings)
        ORDER BY "bookingId", "createdAt" DESC
      ),
      unread AS (
        SELECT "bookingId", COUNT(*) AS unread_count
        FROM "Message"
        WHERE "receiverId" = $1 AND "isRead" = false
        GROUP BY "bookingId"
      )
      SELECT
        b.id            AS "bookingId",
        b."hostId",
        b."guestId",
        l."messageId",
        l.content,
        l."createdAt"    AS "lastMessageAt",
        COALESCE(u.unread_count,0) AS "unreadCount"
      FROM "Booking" b
      JOIN last_msg l ON l."bookingId" = b.id
      LEFT JOIN unread u ON u."bookingId" = b.id
      WHERE b."hostId" = $1 OR b."guestId" = $1
      ORDER BY l."createdAt" DESC
      LIMIT $2 OFFSET $3
    `,
      userId,
      pageSize,
      offset,
    );

    if (!rows.length) return { items: [], total: 0 };

    // STEP 2 — fetch needed users in ONE query
    const userIds = Array.from(
      new Set(rows.flatMap((r) => [r.hostId, r.guestId])),
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, profilePhoto: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    // STEP 3 — build response
    const items = rows.map((r) => {
      const withUserId = r.hostId === userId ? r.guestId : r.hostId;
      const u = userMap[withUserId];

      return {
        bookingId: r.bookingId,
        lastMessage: {
          id: r.messageId,
          content: r.content,
          createdAt: r.lastMessageAt,
        },
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

    // STEP 4 — total count of conversations
    const [{ count }] = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
      `
      SELECT COUNT(*)::int AS count
      FROM "Booking"
      WHERE "hostId" = $1 OR "guestId" = $1
    `,
      userId,
    );

    return { items, total: Number(count) };
  }

  // Utility: verify if user is part of booking (host or guest)
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
}
