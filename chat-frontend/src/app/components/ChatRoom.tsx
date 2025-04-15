import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../services/socket';
import { Message } from '../../types';
import  api  from '../services/api';

interface ChatRoomProps {
  roomId: number;
  currentUser: { id: number; username: string };
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    
    // Load initial messages
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };
    
    fetchMessages();

    // Setup socket listeners
    socket.emit('join_room', roomId);
    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.off('new_message');
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const socket = getSocket();
    socket.emit('send_message', {
      roomId,
      content: messageInput,
    });

    setMessageInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.user.id === currentUser.id ? 'text-right' : ''}`}
          >
            <div className="font-semibold">{message.user.username}</div>
            <div className="bg-gray-200 rounded-lg p-2 inline-block">
              {message.content}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;