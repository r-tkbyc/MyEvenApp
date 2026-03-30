import { useGlasses } from 'even-toolkit/useGlasses';
import { getState } from '../store';
import { toDisplayData, onGlassAction, deriveScreen } from './display';

export function AppGlasses() {
  useGlasses({
    getSnapshot: getState,
    toDisplayData,
    onGlassAction,
    deriveScreen,
    appName: 'Ring Test',
  });

  return null;
}
