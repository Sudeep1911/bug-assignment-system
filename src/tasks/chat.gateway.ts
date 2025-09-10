import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.shema';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTaskChat')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatId') chatId: string,
  ) {
    client.join(chatId);
    this.logger.log(`Client ${client.id} joined room ${chatId}`);
    // You can also emit previous messages here
    const messages = await this.chatService.getMessagesByChatId(chatId);
    client.emit('messages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      chatId: string;
      text: string;
      userId: string;
      attachments?: any[];
    },
  ) {
    const newMessage = await this.chatService.createMessage(
      payload.chatId,
      payload,
    );
    // Broadcast the new message to everyone in the specific room
    this.server.to(payload.chatId).emit('message', newMessage);
  }
}
