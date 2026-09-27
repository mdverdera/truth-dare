'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomStatePayload } from '@/lib/types';
import PlayerList from './PlayerList';
import PromptCard from './PromptCard';
import TurnIndicator from './TurnIndicator';

interface GameScreenProps {
  roomState: RoomStatePayload;
  playerId: string;
  onSelectTruth: () => void;
  onSelectDare: () => void;
  onSelectRandom: () => void;
  onNextTurn: () => void;
  onLeave: () => void;
  isHost: boolean;
}

type RandomPhase = 'idle' | 'countdown' | 'reveal';

export default function GameScreen({
  roomState,
  playerId,
  onSelectTruth,
  onSelectDare,
  onSelectRandom,
  onNextTurn,
  onLeave,
  isHost,
}: GameScreenProps) {
  const [randomPhase, setRandomPhase] = useState<RandomPhase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [showPlayers, setShowPlayers] = useState(false);

  const isMyTurn = roomState.currentPlayerId === playerId;
  const currentPlayer = roomState.players.find((p) => p.id === roomState.currentPlayerId);
  const hasPrompt = !!roomState.currentPrompt;

  // Reset random animation when turn changes
  useEffect(() => {
    setRandomPhase('idle');
    setCountdown(3);
  }, [roomState.currentPlayerId]);

  const handleRandom = () => {
    setRandomPhase('countdown');
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setRandomPhase('reveal');
        setTimeout(() => {
          onSelectRandom();
          setRandomPhase('idle');
        }, 800);
      } else {
        setCountdown(count);
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="text-lg font-bold text-pink-500">🎲 Truth or Dare</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">
            {roomState.roomCode}
          </span>
          <button
            className="text-xs text-gray-400 hover:text-gray-600"
            onClick={() => setShowPlayers((v) => !v)}
          >
            👥
          </button>
        </div>
      </div>

      {/* Players panel (collapsible) */}
      <AnimatePresence>
        {showPlayers && (
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="card">
              <PlayerList
                players={roomState.players}
                currentPlayerId={roomState.currentPlayerId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn indicator */}
      <TurnIndicator
        playerName={currentPlayer?.displayName ?? '?'}
        isMyTurn={isMyTurn}
      />

      {/* Random countdown overlay */}
      <AnimatePresence>
        {randomPhase !== 'idle' && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-10 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >
              {randomPhase === 'countdown' ? (
                <motion.div
                  key={countdown}
                  className="text-7xl font-black text-pink-500"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {countdown}
                </motion.div>
              ) : (
                <motion.div
                  className="text-4xl font-black text-lavender-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  GO! 🎲
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="space-y-4">
        {/* Prompt card */}
        {hasPrompt && roomState.currentPromptType && (
          <PromptCard
            promptType={roomState.currentPromptType}
            prompt={roomState.currentPrompt!}
            playerName={currentPlayer?.displayName ?? '?'}
          />
        )}

        {/* Action buttons: only current player sees them, and only before prompt is selected */}
        {isMyTurn && !hasPrompt && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.button
              className="w-full py-5 rounded-2xl bg-lavender-100 border-2 border-lavender-200 text-lavender-600 font-bold text-lg hover:bg-lavender-200 active:scale-95 transition-all"
              onClick={onSelectTruth}
              whileTap={{ scale: 0.97 }}
            >
              💭 TRUTH
            </motion.button>

            <motion.button
              className="w-full py-5 rounded-2xl bg-pink-100 border-2 border-pink-200 text-pink-600 font-bold text-lg hover:bg-pink-200 active:scale-95 transition-all"
              onClick={onSelectDare}
              whileTap={{ scale: 0.97 }}
            >
              🎯 DARE
            </motion.button>

            <motion.button
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-100 to-lavender-100 border-2 border-pink-200 text-gray-600 font-bold text-lg hover:opacity-90 active:scale-95 transition-all"
              onClick={handleRandom}
              whileTap={{ scale: 0.97 }}
            >
              🎲 RANDOM
            </motion.button>
          </motion.div>
        )}

        {/* Next turn button: only current player, after prompt selected */}
        {isMyTurn && hasPrompt && (
          <motion.button
            className="btn-primary mt-2"
            onClick={onNextTurn}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
          >
            Next Player →
          </motion.button>
        )}

        {/* Waiting message for non-current players */}
        {!isMyTurn && !hasPrompt && (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-3xl mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌸
            </motion.div>
            <p className="text-gray-400 text-sm">
              Waiting for {currentPlayer?.displayName ?? '?'}…
            </p>
          </motion.div>
        )}

        {/* Leave / End */}
        {isHost && (
          <button onClick={onLeave} className="btn-ghost text-sm mt-2">
            End Game
          </button>
        )}
      </div>
    </div>
  );
}
