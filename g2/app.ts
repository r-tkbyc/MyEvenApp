import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { initBoard, setBridge } from './state'
import { initDisplay, pushFrame } from './renderer'
import { onEvenHubEvent, setRenderCallback } from './events'

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)
  
  initBoard()
  
  setRenderCallback(() => {
    void pushFrame()
  })

  appBridge.onEvenHubEvent((event) => {
    onEvenHubEvent(event)
  })

  await initDisplay()
  await pushFrame()
  appendEventLog('Puzzle: ready.')
}
