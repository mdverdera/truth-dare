import { v4 as uuidv4 } from 'uuid';

/** Generate a random 6-character alphanumeric room code (uppercase) */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Generate a unique player ID */
export function generatePlayerId(): string {
  return uuidv4();
}

/** Pick a random integer in [0, max) */
export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}
