import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import {
  ClientMessage,
  ServerMessage,
  Room,
} from './types';
import {
  createRoom,
  joinRoom,
  removePlayerFromRoom,
  setPlayerReady,
  startGame,
  advanceTurn,
  endGame,
  resetGame,
  roomToState,
  getConnectedPlayers,
  getRoom,
  startCleanupInterval,
} from './rooms';
import { selectPrompt, selectRandom } from './game';

// ─── Connection registry ─────────────────────────────────────────────────────

// Maps playerId → WebSocket
const playerSockets = new Map<string, WebSocket>();
// Maps WebSocket → { playerId, roomCode }
const socketMeta = new Map<WebSocket, { playerId: string; roomCode: string }>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function sendError(ws: WebSocket, code: string, message: string): void {
  send(ws, { type: 'ERROR', code, message });
}

function broadcastToRoom(roomCode: string, msg: ServerMessage, exclude?: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  for (const player of room.players.values()) {
    if (exclude && player.id === exclude) continue;
    const ws = playerSockets.get(player.id);
    if (ws) send(ws, msg);
  }
}

function broadcastToAll(roomCode: string, msg: ServerMessage): void {
  broadcastToRoom(roomCode, msg);
}

// ─── Message handlers ─────────────────────────────────────────────────────────

function handleCreateRoom(ws: WebSocket, msg: ClientMessage & { type: 'CREATE_ROOM' }): void {
  if (!msg.displayName?.trim()) {
    return sendError(ws, 'INVALID_NAME', 'Display name is required.');
  }

  const { room, player } = createRoom(msg.displayName.trim());
  playerSockets.set(player.id, ws);
  socketMeta.set(ws, { playerId: player.id, roomCode: room.roomCode });

  send(ws, {
    type: 'ROOM_CREATED',
    roomCode: room.roomCode,
    playerId: player.id,
    roomState: roomToState(room),
  });
}

function handleJoinRoom(ws: WebSocket, msg: ClientMessage & { type: 'JOIN_ROOM' }): void {
  if (!msg.roomCode?.trim()) {
    return sendError(ws, 'INVALID_CODE', 'Room code is required.');
  }
  if (!msg.displayName?.trim()) {
    return sendError(ws, 'INVALID_NAME', 'Display name is required.');
  }

  const result = joinRoom(msg.roomCode.trim().toUpperCase(), msg.displayName.trim());
  if (!result) {
    return sendError(ws, 'ROOM_NOT_FOUND', "Oops! We couldn't find that room. 🌸");
  }

  const { room, player } = result;
  playerSockets.set(player.id, ws);
  socketMeta.set(ws, { playerId: player.id, roomCode: room.roomCode });

  send(ws, {
    type: 'ROOM_JOINED',
    roomCode: room.roomCode,
    playerId: player.id,
    roomState: roomToState(room),
  });

  broadcastToRoom(room.roomCode, {
    type: 'PLAYER_JOINED',
    player: {
      id: player.id,
      displayName: player.displayName,
      isReady: player.isReady,
      connected: player.connected,
      isHost: false,
    },
    roomState: roomToState(room),
  }, player.id);
}

function handleLeaveRoom(ws: WebSocket, msg: ClientMessage & { type: 'LEAVE_ROOM' }): void {
  const meta = socketMeta.get(ws);
  if (!meta) return;

  handleDisconnect(ws, meta.playerId, meta.roomCode);
}

function handlePlayerReady(ws: WebSocket, msg: ClientMessage & { type: 'PLAYER_READY' }): void {
  const meta = socketMeta.get(ws);
  if (!meta || meta.playerId !== msg.playerId || meta.roomCode !== msg.roomCode) {
    return sendError(ws, 'UNAUTHORIZED', 'Invalid player or room.');
  }

  const room = setPlayerReady(msg.roomCode, msg.playerId, msg.isReady);
  if (!room) return sendError(ws, 'ROOM_NOT_FOUND', 'Room not found.');

  broadcastToAll(msg.roomCode, {
    type: 'PLAYER_READY',
    playerId: msg.playerId,
    isReady: msg.isReady,
    roomState: roomToState(room),
  });
}

function handleStartGame(ws: WebSocket, msg: ClientMessage & { type: 'START_GAME' }): void {
  const meta = socketMeta.get(ws);
  if (!meta || meta.playerId !== msg.playerId || meta.roomCode !== msg.roomCode) {
    return sendError(ws, 'UNAUTHORIZED', 'Invalid player or room.');
  }

  const result = startGame(msg.roomCode, msg.playerId);
  if (result === null) return sendError(ws, 'ROOM_NOT_FOUND', 'Room not found.');
  if (result === 'not_host') return sendError(ws, 'NOT_HOST', 'Only the host can start the game.');
  if (result === 'not_enough') return sendError(ws, 'NOT_ENOUGH_PLAYERS', 'Need at least 2 players to start.');

  const room = result as Room;
  const state = roomToState(room);

  broadcastToAll(msg.roomCode, {
    type: 'GAME_STARTED',
    roomState: state,
  });

  const currentId = room.turnOrder[room.currentPlayerIndex];
  const currentPlayer = room.players.get(currentId);
  broadcastToAll(msg.roomCode, {
    type: 'TURN_CHANGED',
    currentPlayerId: currentId,
    currentPlayerName: currentPlayer?.displayName ?? '',
    roomState: state,
  });
}

function handleSelectTruth(ws: WebSocket, msg: ClientMessage & { type: 'SELECT_TRUTH' }): void {
  handleSelectPrompt(ws, msg.roomCode, msg.playerId, 'truth');
}

function handleSelectDare(ws: WebSocket, msg: ClientMessage & { type: 'SELECT_DARE' }): void {
  handleSelectPrompt(ws, msg.roomCode, msg.playerId, 'dare');
}

function handleSelectRandom(ws: WebSocket, msg: ClientMessage & { type: 'SELECT_RANDOM' }): void {
  const meta = socketMeta.get(ws);
  if (!meta || meta.playerId !== msg.playerId || meta.roomCode !== msg.roomCode) {
    return sendError(ws, 'UNAUTHORIZED', 'Invalid player or room.');
  }

  const room = getRoom(msg.roomCode);
  if (!room) return sendError(ws, 'ROOM_NOT_FOUND', 'Room not found.');
  if (room.status !== 'playing') return sendError(ws, 'NOT_PLAYING', 'Game is not in progress.');

  const currentId = room.turnOrder[room.currentPlayerIndex];
  if (currentId !== msg.playerId) {
    return sendError(ws, 'NOT_YOUR_TURN', 'It is not your turn.');
  }

  const { promptType, prompt } = selectRandom(room);
  const player = room.players.get(msg.playerId);

  broadcastToAll(msg.roomCode, {
    type: 'PROMPT_SELECTED',
    promptType,
    prompt,
    playerId: msg.playerId,
    playerName: player?.displayName ?? '',
    roomState: roomToState(room),
  });
}

function handleSelectPrompt(
  ws: WebSocket,
  roomCode: string,
  playerId: string,
  type: 'truth' | 'dare',
): void {
  const meta = socketMeta.get(ws);
  if (!meta || meta.playerId !== playerId || meta.roomCode !== roomCode) {
    return sendError(ws, 'UNAUTHORIZED', 'Invalid player or room.');
  }

  const room = getRoom(roomCode);
  if (!room) return sendError(ws, 'ROOM_NOT_FOUND', 'Room not found.');
  if (room.status !== 'playing') return sendError(ws, 'NOT_PLAYING', 'Game is not in progress.');

  const currentId = room.turnOrder[room.currentPlayerIndex];
  if (currentId !== playerId) {
    return sendError(ws, 'NOT_YOUR_TURN', 'It is not your turn.');
  }

  const { promptType, prompt } = selectPrompt(room, type);
  const player = room.players.get(playerId);

  broadcastToAll(roomCode, {
    type: 'PROMPT_SELECTED',
    promptType,
    prompt,
    playerId,
    playerName: player?.displayName ?? '',
    roomState: roomToState(room),
  });
}

function handleNextTurn(ws: WebSocket, msg: ClientMessage & { type: 'NEXT_TURN' }): void {
  const meta = socketMeta.get(ws);
  if (!meta || meta.playerId !== msg.playerId || meta.roomCode !== msg.roomCode) {
    return sendError(ws, 'UNAUTHORIZED', 'Invalid player or room.');
  }

  const result = advanceTurn(msg.roomCode, msg.playerId);
  if (result === null) return sendError(ws, 'ROOM_NOT_FOUND', 'Room not found.');
  if (result === 'not_current') return sendError(ws, 'NOT_YOUR_TURN', 'It is not your turn.');

  const room = result as Room;
  const currentId = room.turnOrder[room.currentPlayerIndex];
  const currentPlayer = room.players.get(currentId);

  broadcastToAll(msg.roomCode, {
    type: 'TURN_CHANGED',
    currentPlayerId: currentId,
    currentPlayerName: currentPlayer?.displayName ?? '',
    roomState: roomToState(room),
  });
}

// ─── Disconnect handler ───────────────────────────────────────────────────────

function handleDisconnect(ws: WebSocket, playerId: string, roomCode: string): void {
  const room = getRoom(roomCode);
  const disconnectedName = room?.players.get(playerId)?.displayName ?? 'A player';

  playerSockets.delete(playerId);
  socketMeta.delete(ws);

  const updatedRoom = removePlayerFromRoom(roomCode, playerId);

  if (!updatedRoom) {
    // Room was deleted (no players left)
    return;
  }

  broadcastToAll(roomCode, {
    type: 'PLAYER_LEFT',
    playerId,
    displayName: disconnectedName,
    roomState: roomToState(updatedRoom),
  });

  // If game was playing and only 1 player left, end the game
  const connected = getConnectedPlayers(updatedRoom);
  if (updatedRoom.status === 'playing' && connected.length < 2) {
    updatedRoom.status = 'lobby';
    broadcastToAll(roomCode, {
      type: 'ROOM_STATE',
      roomState: roomToState(updatedRoom),
    });
  }
}

// ─── Server setup ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const wss = new WebSocketServer({ host: '0.0.0.0', port: PORT });

console.log(`[server] Truth or Dare WebSocket server listening on port ${PORT}`);

wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
  console.log('[server] New connection');

  ws.on('message', (raw: Buffer | string) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(ws, { type: 'ERROR', code: 'INVALID_JSON', message: 'Invalid message format.' });
      return;
    }

    console.log(`[server] Received: ${msg.type}`);

    switch (msg.type) {
      case 'CREATE_ROOM':
        handleCreateRoom(ws, msg);
        break;
      case 'JOIN_ROOM':
        handleJoinRoom(ws, msg);
        break;
      case 'LEAVE_ROOM':
        handleLeaveRoom(ws, msg);
        break;
      case 'PLAYER_READY':
        handlePlayerReady(ws, msg);
        break;
      case 'START_GAME':
        handleStartGame(ws, msg);
        break;
      case 'SELECT_TRUTH':
        handleSelectTruth(ws, msg);
        break;
      case 'SELECT_DARE':
        handleSelectDare(ws, msg);
        break;
      case 'SELECT_RANDOM':
        handleSelectRandom(ws, msg);
        break;
      case 'NEXT_TURN':
        handleNextTurn(ws, msg);
        break;
      default:
        send(ws, { type: 'ERROR', code: 'UNKNOWN_MESSAGE', message: 'Unknown message type.' });
    }
  });

  ws.on('close', () => {
    const meta = socketMeta.get(ws);
    if (meta) {
      console.log(`[server] Player ${meta.playerId} disconnected from room ${meta.roomCode}`);
      handleDisconnect(ws, meta.playerId, meta.roomCode);
    }
  });

  ws.on('error', (err) => {
    console.error('[server] WebSocket error:', err.message);
  });
});

// ─── Cleanup ──────────────────────────────────────────────────────────────────

startCleanupInterval();

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(): void {
  console.log('[server] Shutting down...');
  wss.close(() => {
    console.log('[server] Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
