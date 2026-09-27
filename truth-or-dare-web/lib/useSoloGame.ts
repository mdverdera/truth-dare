import { useState, useCallback, useRef } from "react";
import { pickTruth, pickDare, pickRandom, PickedPrompt } from "./prompts";

export interface Player {
  name: string;
}

export type GameStatus = "setup" | "playing" | "ended";

export interface GameState {
  players: Player[];
  status: GameStatus;
  currentIndex: number;
  prompt: PickedPrompt | null;
}

export interface UseSoloGameReturn {
  state: GameState;
  startGame: (players: Player[]) => void;
  selectTruth: () => void;
  selectDare: () => void;
  selectRandom: () => void;
  nextTurn: () => void;
  endGame: () => void;
  playAgain: () => void;
  backToSetup: () => void;
}

export function useSoloGame(): UseSoloGameReturn {
  const usedTruths = useRef(new Set<number>());
  const usedDares = useRef(new Set<number>());

  const [state, setState] = useState<GameState>({
    players: [],
    status: "setup",
    currentIndex: 0,
    prompt: null,
  });

  const startGame = useCallback((players: Player[]) => {
    usedTruths.current.clear();
    usedDares.current.clear();
    setState({ players, status: "playing", currentIndex: 0, prompt: null });
  }, []);

  const selectTruth = useCallback(() => {
    const prompt = pickTruth(usedTruths.current);
    setState((s) => ({ ...s, prompt }));
  }, []);

  const selectDare = useCallback(() => {
    const prompt = pickDare(usedDares.current);
    setState((s) => ({ ...s, prompt }));
  }, []);

  const selectRandom = useCallback(() => {
    const prompt = pickRandom(usedTruths.current, usedDares.current);
    setState((s) => ({ ...s, prompt }));
  }, []);

  const nextTurn = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex + 1) % s.players.length,
      prompt: null,
    }));
  }, []);

  const endGame = useCallback(() => {
    setState((s) => ({ ...s, status: "ended" }));
  }, []);

  const playAgain = useCallback(() => {
    usedTruths.current.clear();
    usedDares.current.clear();
    setState((s) => ({ ...s, status: "playing", currentIndex: 0, prompt: null }));
  }, []);

  const backToSetup = useCallback(() => {
    usedTruths.current.clear();
    usedDares.current.clear();
    setState({ players: [], status: "setup", currentIndex: 0, prompt: null });
  }, []);

  return { state, startGame, selectTruth, selectDare, selectRandom, nextTurn, endGame, playAgain, backToSetup };
}
