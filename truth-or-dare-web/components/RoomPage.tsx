'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/useGame';
import RoomLobby from './RoomLobby';
import GameScreen from './GameScreen';
import GameOver from './GameOver';
import JoinRoom from './JoinRoom';
import ConnectionStatus from './ConnectionStatus';

interface RoomPageProps {
  roomCode: string;
}

export default function RoomPage({ roomCode }: RoomPageProps) {
  const {
    connected,
    maxRetriesReached,
    playerId,
    roomState,
    errorMessage,
    lastLeftPlayerName,
    clearError,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    selectTruth,
    selectDare,
    selectRandom,
    nextTurn,
  } = useGame(roomCode);

  // If we have a room state and a player id, we're in the room.
  // Otherwise show the join form for this room code.
  const inRoom = !!roomState && !!playerId;
  const isHost = roomState?.hostPlayerId === playerId;

  const handlePlayAgain = () => {
    // Send a rejoin/start — host clicks Play Again, we reset via leave+rejoin flow
    // For simplicity: just navigate home; the host needs to start a new room
    leaveRoom();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)' }}
    >
      {/* Status bar */}
      <div className="flex justify-end px-4 pt-3">
        <ConnectionStatus connected={connected} maxRetriesReached={maxRetriesReached} />
      </div>

      {/* Player left toast */}
      <AnimatePresence>
        {lastLeftPlayerName && (
          <motion.div
            className="mx-4 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-600 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {lastLeftPlayerName} left the game. 👋
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-500 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {errorMessage}
            <button onClick={clearError} className="ml-2 underline text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Not in room: show join form pre-filled with this room code */}
          {!inRoom && (
            <motion.div
              key="join"
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <JoinRoom
                onBack={() => (window.location.href = '/')}
                onSubmit={(code, name) => joinRoom(code, name)}
                isConnected={connected}
                initialCode={roomCode}
              />
            </motion.div>
          )}

          {/* Lobby */}
          {inRoom && roomState.status === 'lobby' && (
            <motion.div
              key="lobby"
              className="flex-1 flex flex-col pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RoomLobby
                roomState={roomState}
                playerId={playerId}
                onReady={setReady}
                onStartGame={startGame}
                onLeave={leaveRoom}
              />
            </motion.div>
          )}

          {/* Playing */}
          {inRoom && roomState.status === 'playing' && (
            <motion.div
              key="playing"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameScreen
                roomState={roomState}
                playerId={playerId}
                onSelectTruth={selectTruth}
                onSelectDare={selectDare}
                onSelectRandom={selectRandom}
                onNextTurn={nextTurn}
                onLeave={leaveRoom}
                isHost={isHost ?? false}
              />
            </motion.div>
          )}

          {/* Game over */}
          {inRoom && roomState.status === 'ended' && (
            <motion.div
              key="ended"
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameOver
                roomState={roomState}
                playerId={playerId}
                onPlayAgain={handlePlayAgain}
                onBackHome={leaveRoom}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
