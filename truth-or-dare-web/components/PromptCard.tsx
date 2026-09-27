'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PromptType } from '@/lib/types';

interface PromptCardProps {
  promptType: PromptType;
  prompt: string;
  playerName: string;
}

export default function PromptCard({ promptType, prompt, playerName }: PromptCardProps) {
  const isTruth = promptType === 'truth';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prompt}
        className={`rounded-3xl p-6 border-2 ${
          isTruth
            ? 'bg-lavender-50 border-lavender-200'
            : 'bg-pink-50 border-pink-200'
        }`}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-center space-y-4">
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isTruth ? '💭' : '🎯'}
          </motion.div>

          <div>
            <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              isTruth ? 'bg-lavender-200 text-lavender-600' : 'bg-pink-200 text-pink-600'
            }`}>
              {isTruth ? 'Truth' : 'Dare'}
            </span>
          </div>

          <p className={`text-lg font-semibold leading-relaxed ${
            isTruth ? 'text-lavender-700' : 'text-pink-700'
          }`}>
            &ldquo;{prompt}&rdquo;
          </p>

          <p className="text-xs text-gray-400">for {playerName}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
