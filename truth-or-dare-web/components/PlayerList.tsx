'use client';

import { motion } from 'framer-motion';
import { PlayerInfo } from '@/lib/types';

interface PlayerListProps {
  players: PlayerInfo[];
  currentPlayerId?: string | null;
  showReadyState?: boolean;
}

export default function PlayerList({ players, currentPlayerId, showReadyState }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player, i) => (
        <motion.div
          key={player.id}
          className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
            player.id === currentPlayerId
              ? 'border-pink-300 bg-pink-50'
              : 'border-gray-100 bg-white'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <div className="flex items-center gap-3">
            <span className={`text-lg ${player.connected ? '' : 'opacity-40'}`}>
              {player.connected ? '🟢' : '🔴'}
            </span>
            <span className={`font-medium ${player.connected ? 'text-gray-700' : 'text-gray-400'}`}>
              {player.displayName}
              {player.isHost && (
                <span className="ml-1.5 text-xs font-semibold text-lavender-400 bg-lavender-50 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}
              {player.id === currentPlayerId && (
                <span className="ml-1.5 text-xs font-semibold text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full">
                  ← Current
                </span>
              )}
            </span>
          </div>

          {showReadyState && (
            <span className={`text-sm font-medium ${player.isReady ? 'text-emerald-500' : 'text-gray-300'}`}>
              {player.isReady ? '✓ Ready' : 'Not ready'}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
