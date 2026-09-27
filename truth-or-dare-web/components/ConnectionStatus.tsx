'use client';

import { motion } from 'framer-motion';

interface ConnectionStatusProps {
  connected: boolean;
  maxRetriesReached: boolean;
}

export default function ConnectionStatus({ connected, maxRetriesReached }: ConnectionStatusProps) {
  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        Connected
      </div>
    );
  }

  if (maxRetriesReached) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
        Connection lost. Please refresh.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
      <motion.span
        className="w-2 h-2 rounded-full bg-orange-400 inline-block"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      Reconnecting…
    </div>
  );
}
