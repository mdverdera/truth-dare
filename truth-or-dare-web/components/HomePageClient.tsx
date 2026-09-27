'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/useGame';
import HomeScreen from './HomeScreen';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import ConnectionStatus from './ConnectionStatus';

type View = 'home' | 'create' | 'join';

export default function HomePageClient() {
  const [view, setView] = useState<View>('home');
  const {
    connected,
    maxRetriesReached,
    errorMessage,
    clearError,
    createRoom,
    joinRoom,
  } = useGame();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)' }}
    >
      {/* Status bar */}
      <div className="flex justify-end px-4 pt-3">
        <ConnectionStatus connected={connected} maxRetriesReached={maxRetriesReached} />
      </div>

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

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeScreen
                onCreateRoom={() => setView('create')}
                onJoinRoom={() => setView('join')}
              />
            </motion.div>
          )}
          {view === 'create' && (
            <motion.div key="create" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CreateRoom
                onBack={() => setView('home')}
                onSubmit={(name) => createRoom(name)}
                isConnected={connected}
              />
            </motion.div>
          )}
          {view === 'join' && (
            <motion.div key="join" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <JoinRoom
                onBack={() => setView('home')}
                onSubmit={(code, name) => joinRoom(code, name)}
                isConnected={connected}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
