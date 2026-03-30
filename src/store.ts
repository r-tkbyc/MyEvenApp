// Simple global store for ring test events

export interface LogEntry {
  id: number;
  time: string;
  level: 'info' | 'event' | 'error' | 'warn';
  message: string;
}

export interface AppState {
  logs: LogEntry[];
  bridgeStatus: 'waiting' | 'initializing' | 'ready' | 'error';
  bridgeError: string | null;
  glassesConnected: boolean;
  lastRawEvent: string | null;
  tapCount: number;
  doubleTapCount: number;
  swipeUpCount: number;
  swipeDownCount: number;
}

let nextId = 1;

let state: AppState = {
  logs: [],
  bridgeStatus: 'waiting',
  bridgeError: null,
  glassesConnected: false,
  lastRawEvent: null,
  tapCount: 0,
  doubleTapCount: 0,
  swipeUpCount: 0,
  swipeDownCount: 0,
};

let listeners: (() => void)[] = [];

export function getState(): AppState {
  return state;
}

export function subscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  state = { ...state };
  listeners.forEach(fn => fn());
}

function timestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

export function addLog(level: LogEntry['level'], message: string) {
  state.logs = [{ id: nextId++, time: timestamp(), level, message }, ...state.logs].slice(0, 100);
  notify();
}

export function setBridgeStatus(status: AppState['bridgeStatus'], error?: string) {
  state.bridgeStatus = status;
  state.bridgeError = error ?? null;
  notify();
}

export function setGlassesConnected(val: boolean) {
  state.glassesConnected = val;
  notify();
}

export function setLastRawEvent(raw: string) {
  state.lastRawEvent = raw;
  notify();
}

export function incrementEventCount(type: 'tap' | 'doubleTap' | 'swipeUp' | 'swipeDown') {
  switch (type) {
    case 'tap': state.tapCount++; break;
    case 'doubleTap': state.doubleTapCount++; break;
    case 'swipeUp': state.swipeUpCount++; break;
    case 'swipeDown': state.swipeDownCount++; break;
  }
  notify();
}
