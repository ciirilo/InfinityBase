import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connectSocket, disconnectSocket } from '../../services/socket';
import ChatRoom from '../../components/ChatRoom';
import RoomList from '../../components/RoomList';
import  api  from '../../services/api';

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    // Connect socket
    connectSocket(token);

    // Fetch current user
    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get('/users/me');
        setCurrentUser(data);
      } catch (error) {
        router.push('/');
      }
    };

    fetchCurrentUser();

    return () => {
      disconnectSocket();
    };
  }, [router]);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r p-4">
        <RoomList />
      </div>
      <div className="flex-1 flex flex-col">
        {roomId ? (
          <ChatRoom roomId={Number(roomId)} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Select a room to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;