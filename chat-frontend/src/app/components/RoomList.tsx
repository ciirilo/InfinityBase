import React, { useEffect, useState } from 'react';
import  api  from '../services/api';
import Link from 'next/link';

interface Room {
  id: number;
  name: string;
  description: string;
  usersCount: number;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/chat/rooms');
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <div>Loading rooms...</div>;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
      {rooms.map((room) => (
        <Link key={room.id} href={`/chat/${room.id}`} passHref>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-sm text-gray-600">{room.description}</p>
            <p className="text-xs text-gray-500">
              {room.usersCount} user{room.usersCount !== 1 ? 's' : ''} online
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RoomList;