// Simple global store for ring test events

export interface RingEvent {
  id: number;
  time: string;
  type: string;
  raw: string;
}

export interface AppState {
  events: RingEvent[];
  screen: 'log' | 'list' | 'scroll' | 'counter';
  listIndex: number;
  scrollPos: number;
  counter: number;
  connected: boolean;
}

let nextId = 1;

let state: AppState = {
  events: [],
  screen: 'log',
  listIndex: 0,
  scrollPos: 0,
  counter: 0,
  connected: false,
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
  // Create new reference so React detects change
  state = { ...state };
  listeners.forEach(fn => fn());
}

export function setConnected(val: boolean) {
  state.connected = val;
  notify();
}

export function addEvent(type: string, raw: string) {
  const now = new Date();
  const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  state.events = [{ id: nextId++, time, type, raw }, ...state.events].slice(0, 50);
  notify();
}

export function setScreen(screen: AppState['screen']) {
  state.screen = screen;
  state.listIndex = 0;
  state.scrollPos = 0;
  notify();
}

export function setListIndex(idx: number) {
  state.listIndex = idx;
  notify();
}

export function setScrollPos(pos: number) {
  state.scrollPos = pos;
  notify();
}

export function incrementCounter() {
  state.counter++;
  notify();
}

export function resetCounter() {
  state.counter = 0;
  notify();
}
