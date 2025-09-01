import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './chat.shema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('ChatMessage') private chatMessageModel: Model<ChatMessage>,
  ) {}

  async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
    try {
      const messages = await this.chatMessageModel
        .find({ chatId })
        .sort({ createdAt: 1 })
        .exec();
      return messages;
    } catch (err) {
      throw new NotFoundException('Chat not found');
    }
  }

  async createMessage(
    chatId: string,
    createMessageDto: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    const newMessage = new this.chatMessageModel({
      ...createMessageDto,
      chatId, // Use the chatId from the URL parameter
    });
    return await newMessage.save();
  }
}
