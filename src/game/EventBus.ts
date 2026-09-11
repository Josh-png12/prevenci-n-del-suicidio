export type ToastPayload = { message: string; tone?: 'click' | 'clue' | 'seal' | 'safe' | 'phone' | 'scanner' | 'paper' };
export type ActivityNoticePayload = { title: string; message: string; icon?: string; duration?: number };

type Listener = (...args: any[]) => void;

class LocalEventBus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener) {
    const handlers = this.listeners.get(event) ?? new Set<Listener>();
    handlers.add(listener); this.listeners.set(event, handlers); return this;
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener); return this;
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(listener => listener(...args)); return this;
  }

  removeAllListeners() { this.listeners.clear(); return this; }
}

export const EventBus = new LocalEventBus();
