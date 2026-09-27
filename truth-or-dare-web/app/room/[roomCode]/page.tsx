'use client';

import RoomPage from '@/components/RoomPage';

export default function Room({ params }: { params: { roomCode: string } }) {
  return <RoomPage roomCode={params.roomCode.toUpperCase()} />;
}
