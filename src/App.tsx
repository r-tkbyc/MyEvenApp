import { useEffect, useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';
import { initBridge } from './bridge';

const LEVEL_COLORS: Record<string, string> = {
  info: '#0f0',
  event: '#ff0',
  error: '#f44',
  warn: '#fa0',
};

function App() {
  const state = useSyncExternalStore(subscribe, getState);

  useEffect(() => {
    initBridge();
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>R1 Ring Tester</h1>

      {/* Bridge Status */}
      <div style={{
        padding: 10, borderRadius: 8, marginBottom: 12,
        background: state.bridgeStatus === 'ready' ? '#e8f5e9'
          : state.bridgeStatus === 'error' ? '#ffebee'
          : '#fff3e0',
        border: `1px solid ${state.bridgeStatus === 'ready' ? '#4caf50' : state.bridgeStatus === 'error' ? '#f44336' : '#ff9800'}`,
      }}>
        <strong>Bridge: </strong>
        {state.bridgeStatus === 'waiting' && 'Waiting...'}
        {state.bridgeStatus === 'initializing' && 'Initializing...'}
        {state.bridgeStatus === 'ready' && 'Connected'}
        {state.bridgeStatus === 'error' && `Error: ${state.bridgeError}`}
      </div>

      {/* Event Counters */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12,
      }}>
        {[
          { label: 'Tap', count: state.tapCount, color: '#ff0' },
          { label: 'Double Tap', count: state.doubleTapCount, color: '#f80' },
          { label: 'Swipe Up', count: state.swipeUpCount, color: '#0ff' },
          { label: 'Swipe Down', count: state.swipeDownCount, color: '#0af' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{
            background: '#f5f5f5', borderRadius: 8, padding: 10, textAlign: 'center',
            borderLeft: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{count}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Last Raw Event */}
      {state.lastRawEvent && (
        <div style={{
          background: '#f0f0f0', borderRadius: 6, padding: 8, marginBottom: 12,
          fontSize: 10, wordBreak: 'break-all', color: '#666',
        }}>
          <strong>Last raw event:</strong><br />
          {state.lastRawEvent}
        </div>
      )}

      {/* Log */}
      <h2 style={{ fontSize: 14, marginBottom: 6 }}>
        Diagnostic Log ({state.logs.length})
      </h2>
      <div style={{
        background: '#1a1a1a', borderRadius: 8, padding: 10,
        maxHeight: 350, overflowY: 'auto', fontSize: 11, lineHeight: 1.4,
      }}>
        {state.logs.length === 0 ? (
          <div style={{ color: '#666' }}>Initializing...</div>
        ) : (
          state.logs.map(log => (
            <div key={log.id} style={{ marginBottom: 1 }}>
              <span style={{ color: '#666' }}>{log.time} </span>
              <span style={{ color: LEVEL_COLORS[log.level] ?? '#fff' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Help */}
      <div style={{ marginTop: 12, fontSize: 11, color: '#999' }}>
        This app must be opened inside Even App (via QR scan or Even Hub).
        The diagnostic log shows every step of bridge initialization and all raw events from the R1 ring.
      </div>
    </div>
  );
}

export default App;
