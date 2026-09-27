import { Room, Player, RoomStatePayload, PlayerInfo } from './types';
import { generateRoomCode, generatePlayerId } from './utils';

// All active rooms live here. No database.
const rooms = new Map<string, Room>();

// Inactivity timeout: 30 minutes
const ROOM_TIMEOUT_MS = 30 * 60 * 1000;

export function getRooms(): Map<string, Room> {
  return rooms;
}

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode.toUpperCase());
}

export function createRoom(displayName: string): { room: Room; player: Player } {
  let roomCode: string;
  // Ensure unique code
  do {
    roomCode = generateRoomCode();
  } while (rooms.has(roomCode));

  const playerId = generatePlayerId();
  const player: Player = {
    id: playerId,
    displayName,
    isReady: false,
    connected: true,
  };

  const room: Room = {
    roomCode,
    hostPlayerId: playerId,
    players: new Map([[playerId, player]]),
    status: 'lobby',
    turnOrder: [],
    currentPlayerIndex: 0,
    currentPromptType: null,
    currentPrompt: null,
    usedTruthIndexes: new Set(),
    usedDareIndexes: new Set(),
    lastActivity: Date.now(),
  };

  rooms.set(roomCode, room);
  return { room, player };
}

export function joinRoom(
  roomCode: string,
  displayName: string,
): { room: Room; player: Player } | null {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return null;
  if (room.status !== 'lobby') return null;

  const playerId = generatePlayerId();
  const player: Player = {
    id: playerId,
    displayName,
    isReady: false,
    connected: true,
  };

  room.players.set(playerId, player);
  room.lastActivity = Date.now();
  return { room, player };
}

export function removePlayerFromRoom(roomCode: string, playerId: string): Room | null {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const player = room.players.get(playerId);
  if (player) {
    player.connected = false;
  }
  room.lastActivity = Date.now();

  // Remove from turn order if game is playing
  const turnIdx = room.turnOrder.indexOf(playerId);
  if (turnIdx !== -1) {
    room.turnOrder.splice(turnIdx, 1);
    // Adjust current index if needed
    if (room.currentPlayerIndex >= room.turnOrder.length && room.turnOrder.length > 0) {
      room.currentPlayerIndex = 0;
    }
  }

  // If the disconnected player was the current player, auto-advance
  const connectedPlayers = getConnectedPlayers(room);
  if (connectedPlayers.length > 0 && room.status === 'playing') {
    const currentId = room.turnOrder[room.currentPlayerIndex];
    if (!currentId || !room.players.get(currentId)?.connected) {
      // advance to next connected player
      room.currentPlayerIndex = room.currentPlayerIndex % Math.max(room.turnOrder.length, 1);
      room.currentPrompt = null;
      room.currentPromptType = null;
    }
  }

  // Re-assign host if needed
  if (room.hostPlayerId === playerId) {
    const newHost = connectedPlayers.find((p) => p.id !== playerId);
    if (newHost) {
      room.hostPlayerId = newHost.id;
    }
  }

  // If no connected players remain, delete the room
  if (connectedPlayers.filter((p) => p.id !== playerId).length === 0) {
    rooms.delete(roomCode);
    return null;
  }

  return room;
}

export function setPlayerReady(roomCode: string, playerId: string, isReady: boolean): Room | null {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const player = room.players.get(playerId);
  if (!player) return null;

  player.isReady = isReady;
  room.lastActivity = Date.now();
  return room;
}

export function startGame(roomCode: string, playerId: string): Room | 'not_host' | 'not_enough' | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  if (room.hostPlayerId !== playerId) return 'not_host';

  const connected = getConnectedPlayers(room);
  if (connected.length < 2) return 'not_enough';

  room.status = 'playing';
  room.turnOrder = connected.map((p) => p.id);
  room.currentPlayerIndex = 0;
  room.currentPrompt = null;
  room.currentPromptType = null;
  room.usedTruthIndexes.clear();
  room.usedDareIndexes.clear();

  // Reset ready state
  for (const p of room.players.values()) {
    p.isReady = false;
  }

  room.lastActivity = Date.now();
  return room;
}

export function advanceTurn(roomCode: string, playerId: string): Room | 'not_current' | null {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const currentId = room.turnOrder[room.currentPlayerIndex];
  if (currentId !== playerId) return 'not_current';

  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.turnOrder.length;
  room.currentPrompt = null;
  room.currentPromptType = null;
  room.lastActivity = Date.now();
  return room;
}

export function endGame(roomCode: string, playerId: string): Room | 'not_host' | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  if (room.hostPlayerId !== playerId) return 'not_host';

  room.status = 'ended';
  room.lastActivity = Date.now();
  return room;
}

export function resetGame(roomCode: string, playerId: string): Room | 'not_host' | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  if (room.hostPlayerId !== playerId) return 'not_host';

  room.status = 'lobby';
  room.turnOrder = [];
  room.currentPlayerIndex = 0;
  room.currentPrompt = null;
  room.currentPromptType = null;
  room.usedTruthIndexes.clear();
  room.usedDareIndexes.clear();

  for (const p of room.players.values()) {
    p.isReady = false;
  }

  room.lastActivity = Date.now();
  return room;
}

export function getConnectedPlayers(room: Room): Player[] {
  return Array.from(room.players.values()).filter((p) => p.connected);
}

export function roomToState(room: Room): RoomStatePayload {
  const players: PlayerInfo[] = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    displayName: p.displayName,
    isReady: p.isReady,
    connected: p.connected,
    isHost: p.id === room.hostPlayerId,
  }));

  const currentPlayer =
    room.turnOrder.length > 0 ? room.turnOrder[room.currentPlayerIndex] : null;

  return {
    roomCode: room.roomCode,
    players,
    status: room.status,
    currentPlayerId: currentPlayer ?? null,
    currentPromptType: room.currentPromptType,
    currentPrompt: room.currentPrompt,
    hostPlayerId: room.hostPlayerId,
  };
}

/** Periodically clean up inactive rooms */
export function startCleanupInterval(): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
      if (now - room.lastActivity > ROOM_TIMEOUT_MS) {
        console.log(`[cleanup] Removing inactive room ${code}`);
        rooms.delete(code);
      }
    }
  }, 5 * 60 * 1000); // run every 5 minutes
}
