'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useSoloGame } from "@/lib/useSoloGame";
import SetupScreen from "@/components/SetupScreen";
import SoloGameScreen from "@/components/SoloGameScreen";
import SoloGameOver from "@/components/SoloGameOver";

export default function Home() {
  const {
    state,
    startGame,
    selectTruth,
    selectDare,
    selectRandom,
    nextTurn,
    endGame,
    playAgain,
    backToSetup,
  } = useSoloGame();

  return (
    <AnimatePresence mode="wait">
      {state.status === "setup" && (
        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SetupScreen onStart={startGame} />
        </motion.div>
      )}

      {state.status === "playing" && (
        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SoloGameScreen
            state={state}
            onSelectTruth={selectTruth}
            onSelectDare={selectDare}
            onSelectRandom={selectRandom}
            onNextTurn={nextTurn}
            onEndGame={endGame}
          />
        </motion.div>
      )}

      {state.status === "ended" && (
        <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SoloGameOver
            players={state.players}
            onPlayAgain={playAgain}
            onBackToSetup={backToSetup}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
