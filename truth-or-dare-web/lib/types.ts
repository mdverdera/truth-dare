// Shared types between frontend and server

export type RoomStatus = 'lobby' | 'playing' | 'ended';
export type PromptType = 'truth' | 'dare';

export interface PlayerInfo {
  id: string;
  displayName: string;
  isReady: boolean;
  connected: boolean;
  isHost: boolean;
}

export interface RoomStatePayload {
  roomCode: string;
  players: PlayerInfo[];
  status: RoomStatus;
  currentPlayerId: string | null;
  currentPromptType: PromptType | null;
  currentPrompt: string | null;
  hostPlayerId: string;
}

// ─── Client → Server ─────────────────────────────────────────────────────────

export type ClientMessage =
  | { type: 'CREATE_ROOM'; displayName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; displayName: string }
  | { type: 'LEAVE_ROOM'; roomCode: string; playerId: string }
  | { type: 'PLAYER_READY'; roomCode: string; playerId: string; isReady: boolean }
  | { type: 'START_GAME'; roomCode: string; playerId: string }
  | { type: 'SELECT_TRUTH'; roomCode: string; playerId: string }
  | { type: 'SELECT_DARE'; roomCode: string; playerId: string }
  | { type: 'SELECT_RANDOM'; roomCode: string; playerId: string }
  | { type: 'NEXT_TURN'; roomCode: string; playerId: string };

// ─── Server → Client ─────────────────────────────────────────────────────────

export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string; roomState: RoomStatePayload }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; roomState: RoomStatePayload }
  | { type: 'ROOM_STATE'; roomState: RoomStatePayload }
  | { type: 'PLAYER_JOINED'; player: PlayerInfo; roomState: RoomStatePayload }
  | { type: 'PLAYER_LEFT'; playerId: string; displayName: string; roomState: RoomStatePayload }
  | { type: 'PLAYER_READY'; playerId: string; isReady: boolean; roomState: RoomStatePayload }
  | { type: 'GAME_STARTED'; roomState: RoomStatePayload }
  | {
      type: 'PROMPT_SELECTED';
      promptType: PromptType;
      prompt: string;
      playerId: string;
      playerName: string;
      roomState: RoomStatePayload;
    }
  | {
      type: 'TURN_CHANGED';
      currentPlayerId: string;
      currentPlayerName: string;
      roomState: RoomStatePayload;
    }
  | { type: 'ERROR'; code: string; message: string }
  | { type: 'ROOM_CLOSED'; reason: string };

// ─── App state ────────────────────────────────────────────────────────────────

export type AppView = 'home' | 'create' | 'join' | 'room';

export interface AppState {
  view: AppView;
  playerId: string | null;
  roomState: RoomStatePayload | null;
  errorMessage: string | null;
  lastLeftPlayerName: string | null;
}
