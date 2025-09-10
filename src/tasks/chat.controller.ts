import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.shema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatId/messages')
  async getChatMessages(@Param('chatId') chatId: string) {
    try {
      const messages = await this.chatService.getMessagesByChatId(chatId);
      return {
        ok: true, // The frontend was checking for a `ok: true` property
        messages,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':chatId/messages')
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() message: Partial<ChatMessage>,
  ) {
    try {
      // The frontend sends `userId`, `text`, and `attachments` in the body.
      // We pass the `chatId` from the URL parameter to the service.
      const newMessage = await this.chatService.createMessage(chatId, message);
      return newMessage; // Return the created message object
    } catch (error) {
      throw new HttpException(
        'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
