import { OsEventTypeList, type EvenHubEvent } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, cycleFocus, incrementFocused, decrementFocused, activateFocused } from './state'

let startAppFn: () => void = () => {}

export function setStartApp(fn: () => void): void {
  startAppFn = fn
}

const SCROLL_COOLDOWN_MS = 150
let lastScrollTime = 0

function scrollThrottled(): boolean {
  const now = Date.now()
  if (now - lastScrollTime < SCROLL_COOLDOWN_MS) return true
  lastScrollTime = now
  return false
}

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
    if (v.includes('DOUBLE')) return OsEventTypeList.DOUBLE_CLICK_EVENT
    if (v.includes('CLICK')) return OsEventTypeList.CLICK_EVENT
    if (v.includes('SCROLL_TOP') || v.includes('UP')) return OsEventTypeList.SCROLL_TOP_EVENT
    if (v.includes('SCROLL_BOTTOM') || v.includes('DOWN')) return OsEventTypeList.SCROLL_BOTTOM_EVENT
  }

  if (event.listEvent || event.textEvent || event.sysEvent) return OsEventTypeList.CLICK_EVENT

  return undefined
}

export function onEvenHubEvent(event: EvenHubEvent): void {
  const eventType = resolveEventType(event)
  appendEventLog(`Event: type=${String(eventType)} focus=${state.focusIndex}`)

  switch (eventType) {
    case OsEventTypeList.CLICK_EVENT:
      cycleFocus()
      break

    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      activateFocused()
      break

    case OsEventTypeList.SCROLL_TOP_EVENT:
      if (!scrollThrottled()) {
        incrementFocused()
      }
      break

    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      if (!scrollThrottled()) {
        decrementFocused()
      }
      break
  }
}
