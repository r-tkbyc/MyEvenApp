import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

export const state = {
  screen: 'preset' as 'preset' | 'timer',
  presetIndex: 0, // 0: 5 min, 1: 3 min, 2: Manual
  hours: 0,
  minutes: 0,
  seconds: 0,
  running: false,
  focusIndex: 0, // 0: HH, 1: MM, 2: SS, 3: Start, 4: Stop, 5: Reset
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}

export function resetTimer(): void {
  // Go back to the preset selection screen
  state.screen = 'preset'
  state.presetIndex = 0
  
  state.hours = 0
  state.minutes = 0
  state.seconds = 0
  state.running = false
  state.focusIndex = 0
}

export function startTimer(): void {
  const totalSeconds = state.hours * 3600 + state.minutes * 60 + state.seconds
  if (totalSeconds > 0) {
    state.running = true
  }
}

export function stopTimer(): void {
  state.running = false
}

export function tick(): void {
  if (!state.running) return
  
  let totalSeconds = state.hours * 3600 + state.minutes * 60 + state.seconds
  if (totalSeconds > 0) {
    totalSeconds -= 1
    state.hours = Math.floor(totalSeconds / 3600)
    state.minutes = Math.floor((totalSeconds % 3600) / 60)
    state.seconds = totalSeconds % 60
  }
  
  if (totalSeconds === 0) {
    state.running = false
    // Move focus to Reset when finished
    state.focusIndex = 5
  }
}

// Logic for button increments
export function incrementFocused(): void {
  if (state.screen === 'preset') {
    state.presetIndex = state.presetIndex === 0 ? 2 : state.presetIndex - 1
    return
  }
  
  if (state.running) return // Can't edit while running
  if (state.focusIndex === 0) {
    state.hours = (state.hours + 1) % 100
  } else if (state.focusIndex === 1) {
    state.minutes = (state.minutes + 1) % 60
  } else if (state.focusIndex === 2) {
    state.seconds = (state.seconds + 1) % 60
  }
}

export function decrementFocused(): void {
  if (state.screen === 'preset') {
    state.presetIndex = (state.presetIndex + 1) % 3
    return
  }

  if (state.running) return
  if (state.focusIndex === 0) {
    state.hours = state.hours === 0 ? 99 : state.hours - 1
  } else if (state.focusIndex === 1) {
    state.minutes = state.minutes === 0 ? 59 : state.minutes - 1
  } else if (state.focusIndex === 2) {
    state.seconds = state.seconds === 0 ? 59 : state.seconds - 1
  }
}

export function cycleFocus(): void {
  if (state.screen === 'preset') {
    state.presetIndex = (state.presetIndex + 1) % 3
    return
  }
  
  state.focusIndex = (state.focusIndex + 1) % 6
}

export function activateFocused(): void {
  if (state.screen === 'preset') {
    // Apply preset and transition to timer screen
    state.hours = 0
    state.seconds = 0
    if (state.presetIndex === 0) {
      state.minutes = 5 // 5 minutes
    } else if (state.presetIndex === 1) {
      state.minutes = 3 // 3 minutes
    } else {
      state.minutes = 0 // Manual
    }
    
    // Switch to timer screen and focus the Start button
    state.screen = 'timer'
    state.focusIndex = 3
    state.running = false
    return
  }

  if (state.focusIndex === 3) {
    startTimer()
  } else if (state.focusIndex === 4) {
    stopTimer()
  } else if (state.focusIndex === 5) {
    resetTimer()
  }
}
