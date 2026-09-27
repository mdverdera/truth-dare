// All WebSocket message types for Truth or Dare

// ─── Client → Server message types ──────────────────────────────────────────

export type ClientMessageType =
  | 'CREATE_ROOM'
  | 'JOIN_ROOM'
  | 'LEAVE_ROOM'
  | 'PLAYER_READY'
  | 'START_GAME'
  | 'SELECT_TRUTH'
  | 'SELECT_DARE'
  | 'SELECT_RANDOM'
  | 'NEXT_TURN';

export interface CreateRoomMessage {
  type: 'CREATE_ROOM';
  displayName: string;
}

export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  roomCode: string;
  displayName: string;
}

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
  roomCode: string;
  playerId: string;
}

export interface PlayerReadyMessage {
  type: 'PLAYER_READY';
  roomCode: string;
  playerId: string;
  isReady: boolean;
}

export interface StartGameMessage {
  type: 'START_GAME';
  roomCode: string;
  playerId: string;
}

export interface SelectTruthMessage {
  type: 'SELECT_TRUTH';
  roomCode: string;
  playerId: string;
}

export interface SelectDareMessage {
  type: 'SELECT_DARE';
  roomCode: string;
  playerId: string;
}

export interface SelectRandomMessage {
  type: 'SELECT_RANDOM';
  roomCode: string;
  playerId: string;
}

export interface NextTurnMessage {
  type: 'NEXT_TURN';
  roomCode: string;
  playerId: string;
}

export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | PlayerReadyMessage
  | StartGameMessage
  | SelectTruthMessage
  | SelectDareMessage
  | SelectRandomMessage
  | NextTurnMessage;

// ─── Server → Client message types ──────────────────────────────────────────

export type ServerMessageType =
  | 'ROOM_CREATED'
  | 'ROOM_JOINED'
  | 'ROOM_STATE'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_READY'
  | 'GAME_STARTED'
  | 'PROMPT_SELECTED'
  | 'TURN_CHANGED'
  | 'ERROR'
  | 'ROOM_CLOSED';

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

export type RoomStatus = 'lobby' | 'playing' | 'ended';
export type PromptType = 'truth' | 'dare';

export interface RoomCreatedMessage {
  type: 'ROOM_CREATED';
  roomCode: string;
  playerId: string;
  roomState: RoomStatePayload;
}

export interface RoomJoinedMessage {
  type: 'ROOM_JOINED';
  roomCode: string;
  playerId: string;
  roomState: RoomStatePayload;
}

export interface RoomStateMessage {
  type: 'ROOM_STATE';
  roomState: RoomStatePayload;
}

export interface PlayerJoinedMessage {
  type: 'PLAYER_JOINED';
  player: PlayerInfo;
  roomState: RoomStatePayload;
}

export interface PlayerLeftMessage {
  type: 'PLAYER_LEFT';
  playerId: string;
  displayName: string;
  roomState: RoomStatePayload;
}

export interface PlayerReadyServerMessage {
  type: 'PLAYER_READY';
  playerId: string;
  isReady: boolean;
  roomState: RoomStatePayload;
}

export interface GameStartedMessage {
  type: 'GAME_STARTED';
  roomState: RoomStatePayload;
}

export interface PromptSelectedMessage {
  type: 'PROMPT_SELECTED';
  promptType: PromptType;
  prompt: string;
  playerId: string;
  playerName: string;
  roomState: RoomStatePayload;
}

export interface TurnChangedMessage {
  type: 'TURN_CHANGED';
  currentPlayerId: string;
  currentPlayerName: string;
  roomState: RoomStatePayload;
}

export interface ErrorMessage {
  type: 'ERROR';
  code: string;
  message: string;
}

export interface RoomClosedMessage {
  type: 'ROOM_CLOSED';
  reason: string;
}

export type ServerMessage =
  | RoomCreatedMessage
  | RoomJoinedMessage
  | RoomStateMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | PlayerReadyServerMessage
  | GameStartedMessage
  | PromptSelectedMessage
  | TurnChangedMessage
  | ErrorMessage
  | RoomClosedMessage;

// ─── Internal server types ────────────────────────────────────────────────────

export interface Player {
  id: string;
  displayName: string;
  isReady: boolean;
  connected: boolean;
}

export interface Room {
  roomCode: string;
  hostPlayerId: string;
  players: Map<string, Player>;
  status: RoomStatus;
  turnOrder: string[];
  currentPlayerIndex: number;
  currentPromptType: PromptType | null;
  currentPrompt: string | null;
  usedTruthIndexes: Set<number>;
  usedDareIndexes: Set<number>;
  lastActivity: number;
}
