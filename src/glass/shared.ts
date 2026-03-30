import type { AppState } from '../store';

export type Snapshot = AppState;

export interface Actions {
  navigate: (path: string) => void;
}
