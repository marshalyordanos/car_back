import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  // @ApiPropertyOptional({ type: [String] })
  // @IsArray()
  // @IsOptional()
  // attachments?: string[]; // optional, if you want to support photos/urls
}

export class ListMessagesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  pageSize?: number;
}

export class MarkAsReadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string; // who marks as read -> mark messages received by this user as read
}
