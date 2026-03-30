// Raw bridge initialization and event handling — no even-toolkit abstraction
// Every step logs to the store so we can diagnose issues on the phone screen.

import {
  waitForEvenAppBridge,
  CreateStartUpPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
  type EvenAppBridge,
  type EvenHubEvent,
} from '@evenrealities/even_hub_sdk';
import { addLog, setBridgeStatus, setLastRawEvent, incrementEventCount, getState } from './store';

let bridge: EvenAppBridge | null = null;
let displayText = '';

function eventTypeName(et: number | undefined): string {
  switch (et) {
    case OsEventTypeList.CLICK_EVENT: return 'CLICK (tap)';
    case OsEventTypeList.DOUBLE_CLICK_EVENT: return 'DOUBLE_CLICK (2x tap)';
    case OsEventTypeList.SCROLL_TOP_EVENT: return 'SCROLL_TOP (swipe up)';
    case OsEventTypeList.SCROLL_BOTTOM_EVENT: return 'SCROLL_BOTTOM (swipe down)';
    case OsEventTypeList.FOREGROUND_ENTER_EVENT: return 'FOREGROUND_ENTER';
    case OsEventTypeList.FOREGROUND_EXIT_EVENT: return 'FOREGROUND_EXIT';
    case undefined: return 'CLICK (tap, et=undefined)';
    default: return `UNKNOWN (${et})`;
  }
}

function handleEvent(event: EvenHubEvent) {
  // Log the raw JSON for debugging
  const raw = JSON.stringify(event, null, 0);
  setLastRawEvent(raw);
  addLog('info', `Raw: ${raw.slice(0, 120)}`);

  // Parse the event source
  const ev = event.listEvent ?? event.textEvent ?? event.sysEvent;
  const source = event.listEvent ? 'list' : event.textEvent ? 'text' : event.sysEvent ? 'sys' : 'unknown';

  if (event.audioEvent) {
    addLog('event', 'Audio event received');
    return;
  }

  if (!ev) {
    addLog('warn', `No recognized event payload. Keys: ${Object.keys(event).join(', ')}`);
    return;
  }

  const et = (ev as any).eventType as number | undefined;
  const name = eventTypeName(et);
  addLog('event', `[${source}] ${name}`);

  // Count by type
  if (et === OsEventTypeList.CLICK_EVENT || et === undefined || et === 0) {
    incrementEventCount('tap');
  } else if (et === OsEventTypeList.DOUBLE_CLICK_EVENT) {
    incrementEventCount('doubleTap');
  } else if (et === OsEventTypeList.SCROLL_TOP_EVENT) {
    incrementEventCount('swipeUp');
  } else if (et === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
    incrementEventCount('swipeDown');
  }

  // Update glasses display with latest counts
  updateGlassesDisplay();
}

async function updateGlassesDisplay() {
  if (!bridge) return;
  try {
    const s = getState();
    const text = [
      'R1 RING TESTER',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `  Tap:        ${s.tapCount}`,
      `  Double Tap: ${s.doubleTapCount}`,
      `  Swipe Up:   ${s.swipeUpCount}`,
      `  Swipe Down: ${s.swipeDownCount}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Use R1 ring to test inputs',
    ].join('\n');

    if (text === displayText) return;
    displayText = text;

    await bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'main',
        contentOffset: 0,
        contentLength: 2000,
        content: text,
      })
    );
  } catch (err) {
    addLog('error', `Display update failed: ${err}`);
  }
}

export async function initBridge() {
  addLog('info', 'Starting bridge initialization...');
  setBridgeStatus('initializing');

  // Check if we're in the Even App WebView
  const hasFlutter = !!(window as any).flutter_inappwebview;
  const hasEvenBridge = !!(window as any).EvenAppBridge;
  addLog('info', `flutter_inappwebview: ${hasFlutter}, window.EvenAppBridge: ${hasEvenBridge}`);

  if (!hasFlutter && !hasEvenBridge) {
    addLog('warn', 'Not running inside Even App WebView. Bridge will not be available.');
    addLog('info', 'To test: open this URL via Even App QR scan or Even Hub.');
    setBridgeStatus('error', 'Not inside Even App WebView');
    return;
  }

  try {
    addLog('info', 'Calling waitForEvenAppBridge()...');
    bridge = await Promise.race([
      waitForEvenAppBridge(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Bridge timeout after 10s')), 10000)
      ),
    ]);
    addLog('info', `Bridge obtained! ready=${(bridge as any).ready}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog('error', `waitForEvenAppBridge failed: ${msg}`);
    setBridgeStatus('error', msg);
    return;
  }

  // Create startup page with a single text container
  try {
    addLog('info', 'Creating startup page container...');
    const result = await bridge.createStartUpPageContainer(
      new CreateStartUpPageContainer({
        containerTotalNum: 1,
        textObject: [
          new TextContainerProperty({
            containerID: 1,
            containerName: 'main',
            xPosition: 0,
            yPosition: 0,
            width: 576,
            height: 288,
            borderWidth: 0,
            borderColor: 0,
            paddingLength: 6,
            content: 'R1 RING TESTER\n\nInitializing...',
            isEventCapture: 1,
          }),
        ],
      })
    );
    addLog('info', `createStartUpPageContainer result: ${result} (0=success)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog('error', `createStartUpPageContainer failed: ${msg}`);
    setBridgeStatus('error', `Page creation failed: ${msg}`);
    return;
  }

  // Register event listener
  try {
    addLog('info', 'Registering event listener...');
    bridge.onEvenHubEvent((event: EvenHubEvent) => {
      handleEvent(event);
    });
    addLog('info', 'Event listener registered.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog('error', `onEvenHubEvent failed: ${msg}`);
  }

  // Try to get device info
  try {
    const device = await (bridge as any).getDeviceInfo?.();
    if (device) {
      addLog('info', `Device: model=${device.model}, sn=${device.sn}`);
      if (device.status) {
        addLog('info', `Battery: ${device.status.batteryLevel}%, wearing: ${device.status.isWearing}, connected: ${device.status.connectType}`);
      }
    }
  } catch {
    addLog('warn', 'getDeviceInfo not available');
  }

  setBridgeStatus('ready');
  addLog('info', 'Bridge ready! Try R1 ring inputs now.');
  updateGlassesDisplay();
}
