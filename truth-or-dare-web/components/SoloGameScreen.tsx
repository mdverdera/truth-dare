'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "@/lib/useSoloGame";

interface SoloGameScreenProps {
  state: GameState;
  onSelectTruth: () => void;
  onSelectDare: () => void;
  onSelectRandom: () => void;
  onNextTurn: () => void;
  onEndGame: () => void;
}

type RandomPhase = "idle" | "countdown" | "done";

export default function SoloGameScreen({
  state,
  onSelectTruth,
  onSelectDare,
  onSelectRandom,
  onNextTurn,
  onEndGame,
}: SoloGameScreenProps) {
  const [randomPhase, setRandomPhase] = useState<RandomPhase>("idle");
  const [countdown, setCountdown] = useState(3);

  const currentPlayer = state.players[state.currentIndex];
  const hasPrompt = !!state.prompt;

  useEffect(() => {
    setRandomPhase("idle");
    setCountdown(3);
  }, [state.currentIndex]);

  const handleRandom = () => {
    setRandomPhase("countdown");
    setCountdown(3);
    let count = 3;
    const iv = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(iv);
        setRandomPhase("done");
        setTimeout(() => {
          onSelectRandom();
          setRandomPhase("idle");
        }, 700);
      } else {
        setCountdown(count);
      }
    }, 700);
  };

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)" }}
    >
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur-sm"
        style={{
          background: "rgba(253,242,248,0.85)",
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        }}
      >
        <span className="text-base font-bold text-pink-500">🎲 Truth or Dare</span>
        <button
          onClick={onEndGame}
          className="text-xs text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 transition-colors touch-manipulation min-h-[36px]"
        >
          End Game
        </button>
      </header>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-4">

        {/* Turn banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            className="rounded-3xl py-5 px-4 text-center"
            style={{ background: "rgba(255,255,255,0.75)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-4xl mb-1"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              🌸
            </motion.div>
            <p className="text-2xl font-bold text-pink-500 leading-tight">
              {currentPlayer.name}&apos;s Turn
            </p>
            {!hasPrompt && (
              <p className="text-sm text-gray-400 mt-1">Choose your challenge</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prompt card */}
        <AnimatePresence mode="wait">
          {hasPrompt && state.prompt && (
            <motion.div
              key={state.prompt.text}
              className={`rounded-3xl p-6 border-2 ${
                state.prompt.type === "truth"
                  ? "bg-purple-50 border-purple-200"
                  : "bg-pink-50 border-pink-200"
              }`}
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className="text-center space-y-3">
                <motion.div
                  className="text-5xl"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {state.prompt.type === "truth" ? "💭" : "🎯"}
                </motion.div>

                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  state.prompt.type === "truth"
                    ? "bg-purple-200 text-purple-600"
                    : "bg-pink-200 text-pink-600"
                }`}>
                  {state.prompt.type === "truth" ? "Truth" : "Dare"}
                </span>

                <p className={`text-lg font-semibold leading-relaxed ${
                  state.prompt.type === "truth" ? "text-purple-700" : "text-pink-700"
                }`}>
                  &ldquo;{state.prompt.text}&rdquo;
                </p>

                <p className="text-xs text-gray-400">for {currentPlayer.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choice buttons — before prompt */}
        <AnimatePresence>
          {!hasPrompt && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                className="w-full py-5 rounded-2xl bg-purple-100 border-2 border-purple-200 text-purple-600 font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[64px]"
                onClick={onSelectTruth}
                whileTap={{ scale: 0.96 }}
              >
                💭 TRUTH
              </motion.button>

              <motion.button
                className="w-full py-5 rounded-2xl bg-pink-100 border-2 border-pink-200 text-pink-600 font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[64px]"
                onClick={onSelectDare}
                whileTap={{ scale: 0.96 }}
              >
                🎯 DARE
              </motion.button>

              <motion.button
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200 text-gray-600 font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[64px]"
                onClick={handleRandom}
                whileTap={{ scale: 0.96 }}
              >
                🎲 RANDOM
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next turn — after prompt */}
        <AnimatePresence>
          {hasPrompt && (
            <motion.button
              className="btn-primary text-lg min-h-[56px]"
              onClick={onNextTurn}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
            >
              Next Player →
            </motion.button>
          )}
        </AnimatePresence>

        {/* Player chips */}
        <div
          className="flex gap-2 flex-wrap justify-center pt-1"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {state.players.map((p, i) => (
            <motion.span
              key={i}
              layout
              className={`text-sm px-3 py-1.5 rounded-full font-semibold transition-all ${
                i === state.currentIndex
                  ? "bg-pink-400 text-white shadow-sm scale-105"
                  : "bg-white text-gray-400 border border-gray-200"
              }`}
            >
              {p.name}
            </motion.span>
          ))}
        </div>
      </main>

      {/* ── Random countdown overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {randomPhase !== "idle" && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl px-16 py-10 text-center shadow-2xl mx-6"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {randomPhase === "countdown" ? (
                <motion.div
                  key={countdown}
                  className="text-8xl font-black text-pink-500"
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {countdown}
                </motion.div>
              ) : (
                <motion.div
                  className="text-5xl font-black text-purple-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  GO! 🎲
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
