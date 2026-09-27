import { ClientMessage, ServerMessage } from './types';

type MessageHandler = (msg: ServerMessage) => void;
type StatusHandler = (connected: boolean) => void;

class GameWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isIntentionallyClosed = false;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.doConnect();
  }

  private doConnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[ws] Connected');
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as ServerMessage;
          this.notifyMessage(msg);
        } catch {
          console.error('[ws] Failed to parse message', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[ws] Disconnected');
        this.notifyStatus(false);
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.error('[ws] Error', err);
      };
    } catch (err) {
      console.error('[ws] Failed to create WebSocket', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[ws] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
    this.reconnectAttempts++;
    console.log(`[ws] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, delay);
  }

  send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[ws] Cannot send: not connected');
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get reachedMaxRetries(): boolean {
    return this.reconnectAttempts >= this.maxReconnectAttempts;
  }

  private notifyMessage(msg: ServerMessage): void {
    this.messageHandlers.forEach((handler) => handler(msg));
  }

  private notifyStatus(connected: boolean): void {
    this.statusHandlers.forEach((handler) => handler(connected));
  }
}

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';

export const gameWS = new GameWebSocket(WS_URL);
