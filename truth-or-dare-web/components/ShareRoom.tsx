'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareRoomProps {
  roomCode: string;
}

export default function ShareRoom({ roomCode }: ShareRoomProps) {
  const [copied, setCopied] = useState(false);

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}`
    : `/room/${roomCode}`;

  const shareText = `Join my Truth or Dare game! 🎲\nRoom: ${roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Truth or Dare 🎲',
          text: shareText,
          url: roomUrl,
        });
      } catch {
        // user cancelled or not supported
        await navigator.clipboard.writeText(roomUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-lavender-50 rounded-2xl border-2 border-lavender-100 p-4 space-y-3">
      <p className="text-xs font-semibold text-lavender-400 uppercase tracking-wide">Room Code</p>
      <div className="text-center py-2">
        <span className="text-4xl font-bold text-pink-500 tracking-widest">{roomCode}</span>
      </div>
      <div className="flex gap-2">
        <motion.button
          className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold text-lavender-500 bg-white border-2 border-lavender-200 hover:bg-lavender-50 transition-all"
          onClick={handleCopy}
          whileTap={{ scale: 0.96 }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ✓ Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                📋 Copy Code
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-400 to-lavender-400 hover:from-pink-500 hover:to-lavender-500 transition-all"
          onClick={handleShare}
          whileTap={{ scale: 0.96 }}
        >
          🔗 Share Room
        </motion.button>
      </div>
    </div>
  );
}
