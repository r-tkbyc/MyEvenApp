import { useSyncExternalStore } from 'react';
import { AppGlasses } from './glass/AppGlasses';
import { getState, subscribe, setScreen, resetCounter } from './store';
import type { AppState } from './store';

const SCREEN_LABELS: Record<AppState['screen'], string> = {
  log: 'Event Log',
  list: 'List Test',
  scroll: 'Scroll Test',
  counter: 'Tap Counter',
};

function App() {
  const state = useSyncExternalStore(subscribe, getState);

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <AppGlasses />

      <h1 style={{ fontSize: 20, marginBottom: 8 }}>R1 Ring Tester</h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
        G2 glasses display mirrors the current test screen.
        Use R1 ring or keyboard (arrows/enter/esc) to interact.
      </p>

      {/* Screen selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.keys(SCREEN_LABELS) as AppState['screen'][]).map(s => (
          <button
            key={s}
            onClick={() => { setScreen(s); if (s === 'counter') resetCounter(); }}
            style={{
              padding: '6px 12px',
              border: state.screen === s ? '2px solid #333' : '1px solid #ccc',
              borderRadius: 6,
              background: state.screen === s ? '#333' : '#fff',
              color: state.screen === s ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {SCREEN_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Current screen info */}
      <div style={{
        background: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 16,
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
          Current: {SCREEN_LABELS[state.screen]}
        </div>
        {state.screen === 'list' && (
          <div>Selected index: {state.listIndex}</div>
        )}
        {state.screen === 'scroll' && (
          <div>Scroll position: {state.scrollPos + 1}/10</div>
        )}
        {state.screen === 'counter' && (
          <div>Count: {state.counter}</div>
        )}
      </div>

      {/* Event log */}
      <h2 style={{ fontSize: 16, marginBottom: 8 }}>Event Log ({state.events.length})</h2>
      <div style={{
        background: '#1a1a1a', color: '#0f0', borderRadius: 8,
        padding: 12, maxHeight: 400, overflowY: 'auto', fontSize: 12,
      }}>
        {state.events.length === 0 ? (
          <div style={{ color: '#666' }}>Waiting for R1 ring input...</div>
        ) : (
          state.events.map(ev => (
            <div key={ev.id} style={{ marginBottom: 2 }}>
              <span style={{ color: '#888' }}>{ev.time}</span>{' '}
              <span style={{
                color: ev.type.includes('TAP') ? '#ff0' :
                       ev.type.includes('SWIPE') ? '#0ff' : '#0f0'
              }}>
                {ev.type}
              </span>{' '}
              <span style={{ color: '#666' }}>{ev.raw}</span>
            </div>
          ))
        )}
      </div>

      {/* Usage guide */}
      <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        <strong>R1 Ring Controls:</strong>
        <table style={{ marginTop: 4, borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {[
              ['Single Tap', 'Select / Confirm', 'Enter'],
              ['Double Tap', 'Go Back', 'Esc'],
              ['Swipe Forward', 'Move Down', 'Arrow Down'],
              ['Swipe Backward', 'Move Up', 'Arrow Up'],
            ].map(([ring, action, key]) => (
              <tr key={ring} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px' }}>{ring}</td>
                <td style={{ padding: '4px 8px' }}>{action}</td>
                <td style={{ padding: '4px 8px', color: '#bbb' }}>({key})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
