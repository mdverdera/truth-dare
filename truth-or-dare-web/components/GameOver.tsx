'use client';

import { motion } from 'framer-motion';
import { RoomStatePayload } from '@/lib/types';

interface GameOverProps {
  roomState: RoomStatePayload;
  playerId: string;
  onPlayAgain: () => void;
  onBackHome: () => void;
}

export default function GameOver({ roomState, playerId, onPlayAgain, onBackHome }: GameOverProps) {
  const isHost = roomState.hostPlayerId === playerId;

  return (
    <motion.div
      className="w-full max-w-sm mx-auto px-4 min-h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="card text-center space-y-6 w-full">
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎉
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold text-pink-500">Game Over!</h2>
          <p className="text-gray-400 mt-1">Thanks for playing 🌸</p>
        </div>

        <div className="space-y-3 pt-2">
          {isHost && (
            <motion.button
              className="btn-primary"
              onClick={onPlayAgain}
              whileTap={{ scale: 0.97 }}
            >
              🔄 Play Again
            </motion.button>
          )}

          <motion.button
            className="btn-secondary"
            onClick={onBackHome}
            whileTap={{ scale: 0.97 }}
          >
            🏠 Back Home
          </motion.button>
        </div>

        {!isHost && (
          <p className="text-xs text-gray-400">
            Waiting for the host to start again…
          </p>
        )}
      </div>
    </motion.div>
  );
}
