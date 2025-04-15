import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Room } from '../../chat/entities/room.entity';
import { Message } from '../../chat/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @ManyToMany(() => Room, room => room.users)
  rooms: Room[];

  @OneToMany(() => Message, message => message.user)
  messages: Message[];
}