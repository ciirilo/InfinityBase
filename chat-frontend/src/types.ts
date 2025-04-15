// Tipos básicos
export interface User {
    id: number;
    email: string;
    username: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Room {
    id: number;
    name: string;
    description?: string;
    usersCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Message {
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: User;
    room: Room;
  }
  
  // Tipos para respostas da API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface LoginResponse {
    access_token: string;
    user: User;
  }
  
  export interface RegisterResponse {
    id: number;
    email: string;
    username: string;
    createdAt: string;
  }
  
  // Tipos para eventos do WebSocket
  export interface SocketEventMap {
    'new_message': Message;
    'user_joined': { userId: number; username: string };
    'user_left': { userId: number; username: string };
    'room_created': Room;
    'room_updated': Room;
    'room_deleted': { id: number };
  }
  
  // Tipos para o estado do chat
  export interface ChatState {
    currentRoom: Room | null;
    rooms: Room[];
    messages: Message[];
    onlineUsers: User[];
    loading: boolean;
    error: string | null;
  }
  
  // Tipos para props dos componentes
  export interface AuthFormProps {
    isLogin?: boolean;
    onSubmit: (values: { email: string; password: string; username?: string }) => void;
    loading: boolean;
    error?: string;
  }
  
  export interface ChatRoomProps {
    roomId: number;
    currentUser: User;
  }
  
  export interface MessageProps {
    message: Message;
    isCurrentUser: boolean;
  }
  
  export interface RoomListProps {
    rooms: Room[];
    currentRoomId?: number;
    onRoomSelect: (roomId: number) => void;
  }