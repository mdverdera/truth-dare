'use client';

import { motion } from 'framer-motion';
import { RoomStatePayload } from '@/lib/types';
import PlayerList from './PlayerList';
import ShareRoom from './ShareRoom';

interface RoomLobbyProps {
  roomState: RoomStatePayload;
  playerId: string;
  onReady: (isReady: boolean) => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export default function RoomLobby({
  roomState,
  playerId,
  onReady,
  onStartGame,
  onLeave,
}: RoomLobbyProps) {
  const me = roomState.players.find((p) => p.id === playerId);
  const isHost = roomState.hostPlayerId === playerId;
  const connectedPlayers = roomState.players.filter((p) => p.connected);
  const readyCount = connectedPlayers.filter((p) => p.isReady).length;
  const allReady = connectedPlayers.length >= 2 && readyCount === connectedPlayers.length;
  const myIsReady = me?.isReady ?? false;

  return (
    <motion.div
      className="w-full max-w-sm mx-auto px-4 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center pt-4">
        <div className="text-3xl font-bold text-pink-500">🎲 Truth or Dare</div>
        <div className="text-sm text-gray-400 mt-1">Waiting for players…</div>
      </div>

      {/* Share */}
      <ShareRoom roomCode={roomState.roomCode} />

      {/* Players */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Players</h3>
          <span className="text-sm text-lavender-400 font-medium">
            {readyCount} / {connectedPlayers.length} ready
          </span>
        </div>

        <PlayerList
          players={roomState.players}
          showReadyState
        />
      </div>

      {/* Controls */}
      <div className="space-y-3 pb-8">
        {/* Ready toggle */}
        <motion.button
          className={myIsReady ? 'btn-secondary' : 'btn-primary'}
          onClick={() => onReady(!myIsReady)}
          whileTap={{ scale: 0.97 }}
        >
          {myIsReady ? '✓ Ready!' : 'I\'m Ready'}
        </motion.button>

        {/* Host: Start Game */}
        {isHost && (
          <motion.button
            className="btn-primary"
            onClick={onStartGame}
            disabled={!allReady}
            whileTap={{ scale: 0.97 }}
            style={{ opacity: allReady ? 1 : 0.5 }}
          >
            🚀 Start Game
          </motion.button>
        )}

        {!isHost && (
          <p className="text-center text-xs text-gray-400">
            Waiting for the host to start the game…
          </p>
        )}

        <button onClick={onLeave} className="btn-ghost text-sm">
          ← Leave Room
        </button>
      </div>
    </motion.div>
  );
}
