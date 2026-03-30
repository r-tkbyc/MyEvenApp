import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, setBridge, tick, resetTimer } from './state'
import { initDisplay, pushFrame, forceRebuild } from './renderer'
import { onEvenHubEvent, setStartApp } from './events'

const TICK_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function startApp(): void {
  resetTimer()
  forceRebuild()
  void pushFrame()
  appendEventLog('Timer: resetted')
}

// Background loop for the timer tick
async function appLoop(): Promise<void> {
  while (true) {
    const start = Date.now()
    const wasRunning = state.running
    
    tick()

    if (state.running !== wasRunning || state.running) {
       await pushFrame()
    }

    const elapsed = Date.now() - start
    await sleep(Math.max(0, TICK_MS - elapsed))
  }
}

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)
  setStartApp(startApp)

  appBridge.onEvenHubEvent((event) => {
    onEvenHubEvent(event)
    // Redraw screen on every event instantly for UI feedback
    void pushFrame()
  })

  await initDisplay()
  await pushFrame()
  appendEventLog('Timer: ready.')
  
  void appLoop()
}
