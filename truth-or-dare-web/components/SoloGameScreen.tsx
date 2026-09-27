'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "@/lib/useSoloGame";
import { PromptType } from "@/lib/prompts";

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

  // Reset animation on turn change
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
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf8f0 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-lg font-bold text-pink-500">🎲 Truth or Dare</span>
        <button
          onClick={onEndGame}
          className="text-xs text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-1.5 transition-colors"
        >
          End Game
        </button>
      </div>

      {/* Turn indicator */}
      <div className="px-4 pb-4">
        <motion.div
          key={state.currentIndex}
          className="rounded-3xl p-5 text-center"
          style={{ background: "rgba(255,255,255,0.7)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-3xl mb-1"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            🌸
          </motion.div>
          <p className="text-xl font-bold text-pink-500">{currentPlayer.name}&apos;s Turn</p>
          {!hasPrompt && (
            <p className="text-sm text-gray-400 mt-0.5">Choose your challenge</p>
          )}
        </motion.div>
      </div>

      {/* Random countdown overlay */}
      <AnimatePresence>
        {randomPhase !== "idle" && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl px-16 py-10 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {randomPhase === "countdown" ? (
                <motion.div
                  key={countdown}
                  className="text-8xl font-black text-pink-500"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {countdown}
                </motion.div>
              ) : (
                <motion.div
                  className="text-5xl font-black text-lavender-500"
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

      <div className="flex-1 px-4 space-y-4">
        {/* Prompt card */}
        <AnimatePresence mode="wait">
          {hasPrompt && state.prompt && (
            <motion.div
              key={state.prompt.text}
              className={`rounded-3xl p-6 border-2 ${
                state.prompt.type === "truth"
                  ? "bg-lavender-50 border-lavender-200"
                  : "bg-pink-50 border-pink-200"
              }`}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-center space-y-3">
                <motion.div
                  className="text-4xl"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {state.prompt.type === "truth" ? "💭" : "🎯"}
                </motion.div>
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    state.prompt.type === "truth"
                      ? "bg-lavender-200 text-lavender-600"
                      : "bg-pink-200 text-pink-600"
                  }`}
                >
                  {state.prompt.type === "truth" ? "Truth" : "Dare"}
                </span>
                <p
                  className={`text-lg font-semibold leading-relaxed ${
                    state.prompt.type === "truth" ? "text-lavender-700" : "text-pink-700"
                  }`}
                >
                  &ldquo;{state.prompt.text}&rdquo;
                </p>
                <p className="text-xs text-gray-400">for {currentPlayer.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choice buttons — only shown before prompt selected */}
        {!hasPrompt && (
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

        {/* Next turn — shown after prompt */}
        {hasPrompt && (
          <motion.button
            className="btn-primary"
            onClick={onNextTurn}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
          >
            Next Player →
          </motion.button>
        )}

        {/* Player order strip */}
        <div className="flex gap-2 flex-wrap justify-center pt-2 pb-6">
          {state.players.map((p, i) => (
            <span
              key={i}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                i === state.currentIndex
                  ? "bg-pink-400 text-white shadow-sm"
                  : "bg-white text-gray-400 border border-gray-200"
              }`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
