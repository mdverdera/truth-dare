'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface JoinRoomProps {
  onBack: () => void;
  onSubmit: (roomCode: string, displayName: string) => void;
  isConnected: boolean;
  initialCode?: string;
}

export default function JoinRoom({ onBack, onSubmit, isConnected, initialCode = '' }: JoinRoomProps) {
  const [roomCode, setRoomCode] = useState(initialCode);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && name.trim()) {
      onSubmit(roomCode.trim().toUpperCase(), name.trim());
    }
  };

  return (
    <motion.div
      className="w-full max-w-sm mx-auto px-4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <div className="card space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔗</div>
          <h2 className="text-2xl font-bold text-pink-500">Join Room</h2>
          <p className="text-sm text-gray-400 mt-1">Enter the room code to join</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-lavender-500 mb-2">
              Room Code
            </label>
            <input
              type="text"
              className="input-field uppercase tracking-widest font-bold text-center text-xl"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              autoFocus={!initialCode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lavender-500 mb-2">
              Your Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus={!!initialCode}
            />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={!roomCode.trim() || !name.trim() || !isConnected}
            whileTap={{ scale: 0.97 }}
          >
            {isConnected ? '🚀 Join Room' : 'Connecting…'}
          </motion.button>
        </form>

        <button onClick={onBack} className="btn-ghost">
          ← Back
        </button>
      </div>
    </motion.div>
  );
}
