import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, bridge } from './state'

// G2 display constants
const DISPLAY_WIDTH = 576
const DISPLAY_HEIGHT = 288

let pageSetUp = false
let pushInFlight = false

// Helper to pad numbers
function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

// Global variable to track the *previously rendered* screen mode
// so we know when a full `rebuildPageContainer` is required
let renderedScreen: 'preset' | 'timer' | null = null

// Generate TextContainers for the Current State
function generateContainers(): TextContainerProperty[] {
  const containers: TextContainerProperty[] = []

  // 1. Transparent Event Capture Layer (Required to be exactly 1)
  containers.push(
    new TextContainerProperty({
      containerID: 1,
      containerName: 'evt',
      content: ' ',
      xPosition: 0,
      yPosition: 0,
      width: DISPLAY_WIDTH,
      height: DISPLAY_HEIGHT,
      isEventCapture: 1,
      paddingLength: 0,
    })
  )

  if (state.screen === 'preset') {
    // 2. Title Container
    containers.push(
      new TextContainerProperty({ containerID: 11, containerName: 'title', content: 'Cup Noodles Timer', xPosition: 30, yPosition: 30, width: 300, height: 40, isEventCapture: 0 })
    )

    // 3. Options Container (Merged to respect 4 container max limit)
    const opt1 = state.presetIndex === 0 ? '[5 minutes]' : ' 5 minutes '
    const opt2 = state.presetIndex === 1 ? '[3 minutes]' : ' 3 minutes '
    const opt3 = state.presetIndex === 2 ? '[Manual   ]' : ' Manual    '
    
    // Using spaces to align horizontally
    const optionsRow = `${opt1}      ${opt2}      ${opt3}`

    containers.push(
      new TextContainerProperty({ containerID: 12, containerName: 'opts', content: optionsRow, xPosition: 25, yPosition: 80, width: 520, height: 40, isEventCapture: 0 })
    )
    
  } else {
    // Timer Screen
    const hStr = state.focusIndex === 0 ? `[${pad(state.hours)}]` : ` ${pad(state.hours)} `
    const mStr = state.focusIndex === 1 ? `[${pad(state.minutes)}]` : ` ${pad(state.minutes)} `
    const sStr = state.focusIndex === 2 ? `[${pad(state.seconds)}]` : ` ${pad(state.seconds)} `

    // 2. Time Container (Merged)
    const timeRow = `${hStr}  :  ${mStr}  :  ${sStr}`
    containers.push(
      new TextContainerProperty({ containerID: 22, containerName: 'time', content: timeRow, xPosition: 30, yPosition: 30, width: 300, height: 50, isEventCapture: 0 })
    )

    const startBtn = state.focusIndex === 3 ? '[Start]' : ' Start '
    const stopBtn  = state.focusIndex === 4 ? '[Stop ]' : ' Stop  '
    const resetBtn = state.focusIndex === 5 ? '[Reset]' : ' Reset '

    // 3. Buttons Container (Merged)
    const btnsRow = `${startBtn}      ${stopBtn}      ${resetBtn}`
    containers.push(
      new TextContainerProperty({ containerID: 25, containerName: 'btns', content: btnsRow, xPosition: 25, yPosition: 80, width: 350, height: 50, isEventCapture: 0 })
    )
  }

  return containers
}

async function setupMainPage(): Promise<void> {
  if (!bridge) return
  
  const textProps = generateContainers()
  const config = {
    containerTotalNum: textProps.length,
    textObject: textProps
  }

  await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(config))
  pageSetUp = true
  renderedScreen = state.screen
}

export function forceRebuild(): void {
  renderedScreen = null
}

export async function pushFrame(): Promise<void> {
  if (!bridge || !pageSetUp) return
  if (pushInFlight) return
  pushInFlight = true
  
  try {
    const textProps = generateContainers()
    
    // If the screen mode changed (Preset <-> Timer), we MUST use rebuildPageContainer
    // because we are changing the actual number and IDs of the containers on the screen.
    if (state.screen !== renderedScreen) {
      const config = {
        containerTotalNum: textProps.length,
        textObject: textProps
      }
      await bridge.rebuildPageContainer(new RebuildPageContainer(config))
      renderedScreen = state.screen
    } else {
      // If we are just updating numbers/focus in the *same* screen mode,
      // it's much faster to use textContainerUpgrade for each element.
      // We skip index 0 because that's the transparent event capture layer.
      for (let i = 1; i < textProps.length; i++) {
        const prop = textProps[i]
        await bridge.textContainerUpgrade(
          new TextContainerUpgrade({
            containerID: prop.containerID,
            containerName: prop.containerName,
            contentOffset: 0,
            contentLength: 2000,
            content: prop.content,
          })
        )
      }
    }
  } catch (err) {
    appendEventLog(`Push frame error: ${err}`)
  } finally {
    pushInFlight = false
  }
}

export async function initDisplay(): Promise<void> {
  await setupMainPage()
  appendEventLog('Timer: display initialized')
}
