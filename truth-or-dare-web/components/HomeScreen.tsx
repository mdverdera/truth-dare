'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Decorative sparkle/star elements
function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute text-pink-300 select-none pointer-events-none text-lg"
      style={style}
      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
    >
      ✦
    </motion.div>
  );
}

interface HomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)' }}>
      {/* Decorative sparkles */}
      <Sparkle style={{ top: '8%', left: '10%' }} />
      <Sparkle style={{ top: '15%', right: '12%' }} />
      <Sparkle style={{ bottom: '20%', left: '8%' }} />
      <Sparkle style={{ bottom: '12%', right: '15%' }} />
      <Sparkle style={{ top: '40%', left: '5%' }} />
      <Sparkle style={{ top: '55%', right: '6%' }} />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎲
          </motion.div>
          <h1 className="text-3xl font-bold text-pink-500 tracking-tight">
            Truth or Dare
          </h1>
          <p className="mt-2 text-lavender-400 font-medium text-lg">Ready to play? 🌸</p>
        </motion.div>

        {/* Action card */}
        <motion.div
          className="card space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="btn-primary"
            onClick={onCreateRoom}
            whileTap={{ scale: 0.97 }}
          >
            ✨ Create Room
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={onJoinRoom}
            whileTap={{ scale: 0.97 }}
          >
            🔗 Join Room
          </motion.button>
        </motion.div>

        <p className="text-center mt-6 text-xs text-gray-400">
          No account needed · Just fun 🎉
        </p>
      </motion.div>
    </div>
  );
}
