import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private usersService: UsersService,
  ) {}

  async getUserFromSocket(socket: Socket) {
    const userId = socket['user']?.sub;
    if (!userId) {
      return null;
    }
    return this.usersService.findOneById(userId);
  }

  async joinRoom(userId: number, roomId: number) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    if (!room) {
      throw new Error('Room not found');
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!room.users.some(u => u.id === user.id)) {
      room.users.push(user);
      await this.roomRepository.save(room);
    }

    return room;
  }

  async leaveRoom(userId: number, roomId: number) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    if (!room) {
      throw new Error('Room not found');
    }

    room.users = room.users.filter(user => user.id !== userId);
    await this.roomRepository.save(room);
  }

  async createMessage(userId: number, roomId: number, content: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    const message = this.messageRepository.create({
      content,
      user,
      room,
    });

    return this.messageRepository.save(message);
  }

  async getRoomMessages(roomId: number) {
    return this.messageRepository.find({
      where: { room: { id: roomId } },
      relations: ['user', 'room'],
      order: { createdAt: 'ASC' },
    });
  }

  async getRooms() {
    return this.roomRepository.find({
      relations: ['users'],
    });
  }
}