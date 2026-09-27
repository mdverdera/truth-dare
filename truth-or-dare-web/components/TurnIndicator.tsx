'use client';

import { motion } from 'framer-motion';

interface TurnIndicatorProps {
  playerName: string;
  isMyTurn: boolean;
}

export default function TurnIndicator({ playerName, isMyTurn }: TurnIndicatorProps) {
  return (
    <motion.div
      className="text-center py-4"
      key={playerName}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isMyTurn ? (
        <>
          <motion.div
            className="text-3xl mb-1"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🌟
          </motion.div>
          <p className="text-xl font-bold text-pink-500">Your Turn!</p>
          <p className="text-sm text-gray-400 mt-0.5">Choose your challenge</p>
        </>
      ) : (
        <>
          <div className="text-3xl mb-1">🌸</div>
          <p className="text-xl font-bold text-lavender-500">{playerName}&apos;s Turn</p>
          <p className="text-sm text-gray-400 mt-0.5">Waiting for {playerName}…</p>
        </>
      )}
    </motion.div>
  );
}
