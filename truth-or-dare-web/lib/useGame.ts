'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { gameWS } from '@/lib/websocket';
import { RoomStatePayload, ServerMessage } from '@/lib/types';

interface UseGameReturn {
  connected: boolean;
  maxRetriesReached: boolean;
  playerId: string | null;
  roomState: RoomStatePayload | null;
  errorMessage: string | null;
  lastLeftPlayerName: string | null;
  clearError: () => void;
  createRoom: (displayName: string) => void;
  joinRoom: (roomCode: string, displayName: string) => void;
  leaveRoom: () => void;
  setReady: (isReady: boolean) => void;
  startGame: () => void;
  selectTruth: () => void;
  selectDare: () => void;
  selectRandom: () => void;
  nextTurn: () => void;
  endGame: () => void;
}

export function useGame(initialRoomCode?: string): UseGameReturn {
  const [connected, setConnected] = useState(false);
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastLeftPlayerName, setLastLeftPlayerName] = useState<string | null>(null);

  const playerIdRef = useRef<string | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  const setPlayerIdSync = (id: string | null) => {
    playerIdRef.current = id;
    setPlayerId(id);
  };

  const setRoomStateSync = (state: RoomStatePayload | null) => {
    roomCodeRef.current = state?.roomCode ?? null;
    setRoomState(state);
  };

  useEffect(() => {
    gameWS.connect();

    const unsubStatus = gameWS.onStatus((isConnected) => {
      setConnected(isConnected);
      if (!isConnected) {
        setMaxRetriesReached(gameWS.reachedMaxRetries);
      }
    });

    const unsubMsg = gameWS.onMessage((msg: ServerMessage) => {
      switch (msg.type) {
        case 'ROOM_CREATED':
          setPlayerIdSync(msg.playerId);
          setRoomStateSync(msg.roomState);
          // Navigate to room URL
          window.history.pushState(null, '', `/room/${msg.roomCode}`);
          break;

        case 'ROOM_JOINED':
          setPlayerIdSync(msg.playerId);
          setRoomStateSync(msg.roomState);
          break;

        case 'ROOM_STATE':
        case 'PLAYER_JOINED':
        case 'PLAYER_READY':
        case 'GAME_STARTED':
        case 'PROMPT_SELECTED':
        case 'TURN_CHANGED':
          setRoomStateSync(msg.roomState);
          break;

        case 'PLAYER_LEFT':
          setLastLeftPlayerName(msg.displayName);
          setRoomStateSync(msg.roomState);
          setTimeout(() => setLastLeftPlayerName(null), 4000);
          break;

        case 'ROOM_CLOSED':
          setRoomStateSync(null);
          setPlayerIdSync(null);
          window.history.pushState(null, '', '/');
          setErrorMessage('The room was closed. 🌸');
          break;

        case 'ERROR':
          setErrorMessage(msg.message);
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
      gameWS.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If we land directly on a room URL, attempt to re-join isn't possible without
  // credentials — the player needs to enter their name. We show the join form.

  const clearError = useCallback(() => setErrorMessage(null), []);

  const createRoom = useCallback((displayName: string) => {
    gameWS.send({ type: 'CREATE_ROOM', displayName });
  }, []);

  const joinRoom = useCallback((roomCode: string, displayName: string) => {
    gameWS.send({ type: 'JOIN_ROOM', roomCode, displayName });
  }, []);

  const leaveRoom = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'LEAVE_ROOM', roomCode: rc, playerId: pid });
    }
    setRoomStateSync(null);
    setPlayerIdSync(null);
    window.history.pushState(null, '', '/');
  }, []);

  const setReady = useCallback((isReady: boolean) => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'PLAYER_READY', roomCode: rc, playerId: pid, isReady });
    }
  }, []);

  const startGame = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'START_GAME', roomCode: rc, playerId: pid });
    }
  }, []);

  const selectTruth = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'SELECT_TRUTH', roomCode: rc, playerId: pid });
    }
  }, []);

  const selectDare = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'SELECT_DARE', roomCode: rc, playerId: pid });
    }
  }, []);

  const selectRandom = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'SELECT_RANDOM', roomCode: rc, playerId: pid });
    }
  }, []);

  const nextTurn = useCallback(() => {
    const pid = playerIdRef.current;
    const rc = roomCodeRef.current;
    if (pid && rc) {
      gameWS.send({ type: 'NEXT_TURN', roomCode: rc, playerId: pid });
    }
  }, []);

  const endGame = useCallback(() => {
    // We reuse START_GAME reset via a separate END_GAME pathway
    // For simplicity we send NEXT_TURN which triggers the host to end via UI
    // The host calls this and we set room status to 'ended' via a dedicated message
    // Since we don't have END_GAME in spec, we just navigate home
    leaveRoom();
  }, [leaveRoom]);

  return {
    connected,
    maxRetriesReached,
    playerId,
    roomState,
    errorMessage,
    lastLeftPlayerName,
    clearError,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    selectTruth,
    selectDare,
    selectRandom,
    nextTurn,
    endGame,
  };
}
