import { initApp } from './app'
import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  name: 'Even Sliding Puzzle',
  initialStatus: 'Puzzle booting...',
  createActions: async (updateStatus) => {
    let connected = false
    let bridge: any = null

    return {
      connect: async () => {
        updateStatus('Connecting to bridge...')
        try {
          bridge = await waitForEvenAppBridge()
          await initApp(bridge)
          connected = true
          updateStatus('Puzzle: ready.')
        } catch (err) {
          updateStatus('Failed to connect to Even bridge')
        }
      },
      action: () => {
        if (!connected || !bridge) return
        
        // Reset triggered from web simulator UI
        const dummyEvent = { textEvent: { eventType: 3 } } as any // DOUBLE_CLICK
        bridge.onEvenHubEventCallback?.(dummyEvent)
      }
    }
  }
}

export default app
