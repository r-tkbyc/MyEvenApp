import { OsEventTypeList, type EvenHubEvent } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import {
  state,
  cycleFocusForward,
  cycleFocusBackward,
  moveFocusedTile,
  cycleTitleMenuForward,
  cycleTitleMenuBackward,
  startGame,
  cycleGameMenuForward,
  cycleGameMenuBackward,
  executeGameMenu,
} from './state'

let renderFn: () => void = () => {}
export function setRenderCallback(fn: () => void): void { renderFn = fn }

// ─── Scroll throttle ───────────────────────────────────────────────────────
const SCROLL_COOLDOWN_MS = 150
let lastScrollTime = 0
function scrollThrottled(): boolean {
  const now = Date.now()
  if (now - lastScrollTime < SCROLL_COOLDOWN_MS) return true
  lastScrollTime = now
  return false
}

// ─── Event type resolver ───────────────────────────────────────────────────
export function resolveEventType(event: EvenHubEvent): OsEventTypeList | undefined {
  const raw =
    event.listEvent?.eventType ??
    event.textEvent?.eventType ??
    event.sysEvent?.eventType ??
    ((event.jsonData ?? {}) as Record<string, unknown>).eventType ??
    ((event.jsonData ?? {}) as Record<string, unknown>).event_type ??
    ((event.jsonData ?? {}) as Record<string, unknown>).Event_Type ??
    ((event.jsonData ?? {}) as Record<string, unknown>).type

  if (typeof raw === 'number') {
    switch (raw) {
      case 0: return OsEventTypeList.CLICK_EVENT
      case 1: return OsEventTypeList.SCROLL_TOP_EVENT
      case 2: return OsEventTypeList.SCROLL_BOTTOM_EVENT
      case 3: return OsEventTypeList.DOUBLE_CLICK_EVENT
      default: return undefined
    }
  }

  if (typeof raw === 'string') {
    const v = raw.toUpperCase()
    if (v.includes('DOUBLE'))       return OsEventTypeList.DOUBLE_CLICK_EVENT
    if (v.includes('CLICK'))        return OsEventTypeList.CLICK_EVENT
    if (v.includes('SCROLL_TOP'))   return OsEventTypeList.SCROLL_TOP_EVENT
    if (v.includes('SCROLL_BOTTOM'))return OsEventTypeList.SCROLL_BOTTOM_EVENT
  }

  if (event.listEvent || event.textEvent || event.sysEvent) return OsEventTypeList.CLICK_EVENT
  return undefined
}

// ─── Screen-specific handlers ──────────────────────────────────────────────

function handleTitleEvent(eventType: OsEventTypeList | undefined): void {
  switch (eventType) {
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      if (!scrollThrottled()) { cycleTitleMenuForward(); renderFn() }
      break
    case OsEventTypeList.SCROLL_TOP_EVENT:
      if (!scrollThrottled()) { cycleTitleMenuBackward(); renderFn() }
      break
    case OsEventTypeList.CLICK_EVENT:
      startGame()
      renderFn()
      break
  }
}

function handleGameEvent(eventType: OsEventTypeList | undefined): void {
  switch (eventType) {
    case OsEventTypeList.CLICK_EVENT:
      moveFocusedTile()
      renderFn()
      break
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      // Open the in-game menu
      state.screen = 'game_menu'
      state.gameMenuIndex = 0
      renderFn()
      break
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      if (!scrollThrottled()) { cycleFocusForward(); renderFn() }
      break
    case OsEventTypeList.SCROLL_TOP_EVENT:
      if (!scrollThrottled()) { cycleFocusBackward(); renderFn() }
      break
  }
}

function handleGameMenuEvent(eventType: OsEventTypeList | undefined): void {
  switch (eventType) {
    case OsEventTypeList.CLICK_EVENT:
      executeGameMenu()
      renderFn()
      break
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      if (!scrollThrottled()) { cycleGameMenuForward(); renderFn() }
      break
    case OsEventTypeList.SCROLL_TOP_EVENT:
      if (!scrollThrottled()) { cycleGameMenuBackward(); renderFn() }
      break
  }
}

// ─── Main event dispatcher ─────────────────────────────────────────────────
export function onEvenHubEvent(event: EvenHubEvent): void {
  const eventType = resolveEventType(event)
  appendEventLog(`Event: type=${String(eventType)} screen=${state.screen}`)

  switch (state.screen) {
    case 'title':     handleTitleEvent(eventType);    break
    case 'game':      handleGameEvent(eventType);     break
    case 'game_menu': handleGameMenuEvent(eventType); break
  }
}
