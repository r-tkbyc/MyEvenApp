import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function debugLog(msg: string) {
  const el = document.getElementById('debug');
  if (el) el.textContent += new Date().toLocaleTimeString() + ' ' + msg + '\n';
}

try {
  debugLog('main.tsx executing...');
  const root = document.getElementById('root')!;
  debugLog('Mounting React app...');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  debugLog('React mounted successfully');
} catch (err) {
  const msg = err instanceof Error ? err.message + '\n' + err.stack : String(err);
  debugLog('MOUNT ERROR: ' + msg);
}
