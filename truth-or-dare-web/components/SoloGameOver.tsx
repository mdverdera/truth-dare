'use client';

import { motion } from "framer-motion";
import { Player } from "@/lib/useSoloGame";

interface SoloGameOverProps {
  players: Player[];
  onPlayAgain: () => void;
  onBackToSetup: () => void;
}

export default function SoloGameOver({ players, onPlayAgain, onBackToSetup }: SoloGameOverProps) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5"
      style={{
        background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)",
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <motion.div
        className="card w-full max-w-sm text-center space-y-6"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎉
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold text-pink-500">Game Over!</h2>
          <p className="text-gray-400 mt-1 text-base">That was so fun! 🌸</p>
        </div>

        {/* Player chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {players.map((p, i) => (
            <span
              key={i}
              className="bg-purple-50 text-purple-500 border border-purple-200 text-sm font-semibold px-3 py-1.5 rounded-full"
            >
              {p.name}
            </span>
          ))}
        </div>

        <div className="space-y-3 pt-1">
          <motion.button
            className="btn-primary"
            onClick={onPlayAgain}
            whileTap={{ scale: 0.97 }}
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            className="btn-secondary"
            onClick={onBackToSetup}
            whileTap={{ scale: 0.97 }}
          >
            👥 Change Players
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
