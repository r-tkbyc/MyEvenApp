import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import '@jappyjan/even-realities-ui/styles.css'
import type { AppActions, SetStatus } from '../_shared/app-types'
import { initApp, startApp } from './app'
import { appendEventLog } from '../_shared/log'

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Even bridge not detected within ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => window.clearTimeout(timer))
  })
}

export function createActions(setStatus: SetStatus): AppActions {
  let connected = false

  return {
    async connect() {
      setStatus('Timer: connecting to Even bridge...')
      appendEventLog('Timer: connect requested')

      try {
        const bridge = await withTimeout(waitForEvenAppBridge(), 6000)
        await initApp(bridge)
        connected = true
        setStatus('Timer: connected. Ready!')
        appendEventLog('Timer: connected to bridge')
      } catch (err) {
        console.error('[timer] connect failed', err)
        setStatus('Timer: bridge not found.')
        appendEventLog('Timer: connection failed')
      }
    },

    async action() {
      if (!connected) {
        setStatus('Timer: not connected')
        return
      }
      startApp() // Reset action invoked from Browser Button
      setStatus('Timer: reset!')
    },
  }
}
