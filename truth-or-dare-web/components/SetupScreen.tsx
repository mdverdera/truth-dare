'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/useSoloGame";

interface SetupScreenProps {
  onStart: (players: Player[]) => void;
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute text-pink-300 select-none pointer-events-none text-xl"
      style={style}
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
    >
      ✦
    </motion.div>
  );
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");

  const updateName = (i: number, val: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? val : n)));
    setError("");
  };

  const addPlayer = () => {
    if (names.length < 8) setNames((p) => [...p, ""]);
  };

  const removePlayer = (i: number) => {
    if (names.length > 2) setNames((p) => p.filter((_, idx) => idx !== i));
  };

  const handleStart = () => {
    const trimmed = names.map((n) => n.trim()).filter(Boolean);
    if (trimmed.length < 2) {
      setError("Add at least 2 players to start 🌸");
      return;
    }
    const unique = [...new Set(trimmed)];
    if (unique.length !== trimmed.length) {
      setError("Each player needs a unique name 🌸");
      return;
    }
    onStart(unique.map((name) => ({ name })));
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)" }}
    >
      <Sparkle style={{ top: "6%", left: "8%" }} />
      <Sparkle style={{ top: "12%", right: "10%" }} />
      <Sparkle style={{ bottom: "18%", left: "6%" }} />
      <Sparkle style={{ bottom: "10%", right: "12%" }} />
      <Sparkle style={{ top: "45%", left: "4%" }} />
      <Sparkle style={{ top: "60%", right: "5%" }} />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-3"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🎲
          </motion.div>
          <h1 className="text-3xl font-bold text-pink-500 tracking-tight">Truth or Dare</h1>
          <p className="mt-1 text-lavender-400 font-medium">Who&apos;s playing? 🌸</p>
        </div>

        {/* Player name inputs */}
        <div className="card space-y-4">
          <AnimatePresence>
            {names.map((name, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-semibold text-lavender-400 w-6 text-center">
                  {i + 1}
                </span>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder={`Player ${i + 1}`}
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStart();
                  }}
                />
                {names.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-1"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add player */}
          {names.length < 8 && (
            <button
              onClick={addPlayer}
              className="w-full py-2 rounded-2xl text-sm font-medium text-lavender-400 border-2 border-dashed border-lavender-200 hover:border-lavender-300 hover:bg-lavender-50 transition-all"
            >
              + Add Player
            </button>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-sm text-red-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Start */}
          <motion.button
            className="btn-primary mt-2"
            onClick={handleStart}
            whileTap={{ scale: 0.97 }}
          >
            🚀 Start Game
          </motion.button>
        </div>

        <p className="text-center mt-5 text-xs text-gray-400">
          No sign-up · Works offline · Just fun 🎉
        </p>
      </motion.div>
    </div>
  );
}
