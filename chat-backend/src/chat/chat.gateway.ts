import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(client);
      if (!user) {
        client.disconnect();
        return;
      }
      console.log(`Client connected: ${user.username}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
      client.disconnect();
      return { success: false, message: 'User not authenticated' };
    }
    const room = await this.chatService.joinRoom(user.id, roomId);
    
    client.join(roomId.toString());
    this.server.to(roomId.toString()).emit('user_joined', {
      userId: user.id,
      username: user.username,
    });
    
    return { success: true, room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
      client.disconnect();
      return { success: false, message: 'User not authenticated' };
    }
    await this.chatService.leaveRoom(user.id, roomId);
    
    client.leave(roomId.toString());
    this.server.to(roomId.toString()).emit('user_left', {
      userId: user.id,
      username: user.username,
    });
    
    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; content: string },
  ) {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
      client.disconnect();
      return { success: false, message: 'User not authenticated' };
    }
    const message = await this.chatService.createMessage(
      user.id,
      payload.roomId,
      payload.content,
    );
    
    this.server.to(payload.roomId.toString()).emit('new_message', message);
    return { success: true, message };
  }
}