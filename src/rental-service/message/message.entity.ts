import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: string[]; // optional, if you want to support photos/urls
}

export class ListMessagesQueryDto {
  // reuse your ListQueryDto elsewhere; this is for clarity
  page?: number;
  pageSize?: number;
}

export class MarkAsReadDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  userId: string; // who marks as read -> mark messages received by this user as read
}
