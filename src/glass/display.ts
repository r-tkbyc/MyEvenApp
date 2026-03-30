import type { DisplayData, GlassNavState, GlassAction } from 'even-toolkit/types';

import { getState, addEvent, setScreen, setListIndex, setScrollPos, incrementCounter, resetCounter } from '../store';
import type { AppState } from '../store';

const MENU_ITEMS = ['Event Log', 'List Test', 'Scroll Test', 'Counter'];
const SCREENS: AppState['screen'][] = ['log', 'list', 'scroll', 'counter'];

const SCROLL_LINES = [
  'Line 1: Swipe up/down to scroll',
  'Line 2: This tests scrolling',
  'Line 3: Through multiple lines',
  'Line 4: Of text content',
  'Line 5: On the G2 display',
  'Line 6: Keep scrolling...',
  'Line 7: Almost there...',
  'Line 8: More content here',
  'Line 9: Nearly at the end',
  'Line 10: Last line!',
];

export function toDisplayData(snapshot: AppState, nav: GlassNavState): DisplayData {
  const lines: DisplayData['lines'] = [];
  const ln = (text: string, inverted = false) =>
    lines.push({ text, inverted, style: 'normal' });
  const sep = () =>
    lines.push({ text: '', inverted: false, style: 'separator' });

  switch (snapshot.screen) {
    case 'log': {
      ln('R1 RING TESTER');
      sep();
      if (snapshot.events.length === 0) {
        ln('Waiting for input...');
        ln('');
        ln('Tap / Double-tap /');
        ln('Swipe to test');
      } else {
        // Show last 7 events
        for (const ev of snapshot.events.slice(0, 7)) {
          ln(`${ev.time} ${ev.type}`);
        }
      }
      ln('');
      ln(`Total: ${snapshot.events.length} events`);
      break;
    }

    case 'list': {
      ln('LIST NAVIGATION');
      sep();
      for (let i = 0; i < MENU_ITEMS.length; i++) {
        ln(MENU_ITEMS[i], i === snapshot.listIndex);
      }
      sep();
      ln('Tap=select  2xTap=back');
      break;
    }

    case 'scroll': {
      ln('SCROLL TEST');
      sep();
      const visible = 6;
      const start = Math.min(snapshot.scrollPos, SCROLL_LINES.length - visible);
      const end = Math.min(start + visible, SCROLL_LINES.length);
      for (let i = start; i < end; i++) {
        ln(SCROLL_LINES[i], i === snapshot.scrollPos);
      }
      sep();
      ln(`Pos: ${snapshot.scrollPos + 1}/${SCROLL_LINES.length}`);
      break;
    }

    case 'counter': {
      ln('TAP COUNTER');
      sep();
      ln('');
      ln(`  Count: ${snapshot.counter}`);
      ln('');
      ln('Tap = +1');
      ln('Double-tap = reset');
      sep();
      ln('Swipe = back to menu');
      break;
    }
  }

  return { lines };
}

export function onGlassAction(action: GlassAction, nav: GlassNavState, snapshot: AppState): GlassNavState {
  // Log every action as an event
  if (action.type === 'HIGHLIGHT_MOVE') {
    addEvent(`SWIPE ${action.direction.toUpperCase()}`, `direction=${action.direction}`);
  } else if (action.type === 'SELECT_HIGHLIGHTED') {
    addEvent('TAP', 'single tap');
  } else if (action.type === 'GO_BACK') {
    addEvent('DOUBLE TAP', 'double tap');
  }

  switch (snapshot.screen) {
    case 'log': {
      // In log mode, taps go to menu, swipes just log
      if (action.type === 'SELECT_HIGHLIGHTED') {
        setScreen('list');
        return { ...nav, highlightedIndex: 0 };
      }
      break;
    }

    case 'list': {
      if (action.type === 'HIGHLIGHT_MOVE') {
        const max = MENU_ITEMS.length - 1;
        const newIdx = action.direction === 'up'
          ? Math.max(0, snapshot.listIndex - 1)
          : Math.min(max, snapshot.listIndex + 1);
        setListIndex(newIdx);
      } else if (action.type === 'SELECT_HIGHLIGHTED') {
        setScreen(SCREENS[snapshot.listIndex]);
      } else if (action.type === 'GO_BACK') {
        setScreen('log');
      }
      break;
    }

    case 'scroll': {
      if (action.type === 'HIGHLIGHT_MOVE') {
        const max = SCROLL_LINES.length - 1;
        const newPos = action.direction === 'up'
          ? Math.max(0, snapshot.scrollPos - 1)
          : Math.min(max, snapshot.scrollPos + 1);
        setScrollPos(newPos);
      } else if (action.type === 'GO_BACK') {
        setScreen('list');
      }
      break;
    }

    case 'counter': {
      if (action.type === 'SELECT_HIGHLIGHTED') {
        incrementCounter();
      } else if (action.type === 'GO_BACK') {
        resetCounter();
        setScreen('list');
      } else if (action.type === 'HIGHLIGHT_MOVE') {
        setScreen('list');
      }
      break;
    }
  }

  return nav;
}

export function deriveScreen(path: string): string {
  const s = getState();
  return s.screen;
}
