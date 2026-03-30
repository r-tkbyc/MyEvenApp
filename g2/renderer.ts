import {
  CreateStartUpPageContainer,
  ImageContainerProperty,
  ImageRawDataUpdate,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import {
  state,
  bridge,
  TITLE_MENU_ITEMS,
  GAME_MENU_ITEMS,
  type Screen,
} from './state'

const DISPLAY_WIDTH  = 576
const DISPLAY_HEIGHT = 288

// ─── Canvas / image constants ──────────────────────────────────────────────
// Game grid image: fits within the 200×100 px limit for all grid sizes.
const IMG_W = 180
const IMG_H = 140
const OUTER_PAD = 4   // px from canvas edge to outer border line

// ─── Canvas renderer ───────────────────────────────────────────────────────
function renderGridToPngBase64(): string {
  const canvas = document.createElement('canvas')
  canvas.width  = IMG_W
  canvas.height = IMG_H
  const ctx = canvas.getContext('2d')!

  const gs     = state.gridSize
  const innerW = IMG_W - OUTER_PAD * 2
  const innerH = IMG_H - OUTER_PAD * 2
  const cellW  = innerW / gs
  const cellH  = innerH / gs

  // Background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, IMG_W, IMG_H)

  // Outer border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, IMG_W - 2, IMG_H - 2)

  // Internal grid lines
  ctx.strokeStyle = '#888888'
  ctx.lineWidth = 1
  for (let i = 1; i < gs; i++) {
    const x = OUTER_PAD + i * cellW
    ctx.beginPath(); ctx.moveTo(x, OUTER_PAD); ctx.lineTo(x, IMG_H - OUTER_PAD); ctx.stroke()
    const y = OUTER_PAD + i * cellH
    ctx.beginPath(); ctx.moveTo(OUTER_PAD, y); ctx.lineTo(IMG_W - OUTER_PAD, y); ctx.stroke()
  }

  // Cells
  const fontSize = gs <= 3 ? 18 : 14
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  for (let r = 0; r < gs; r++) {
    for (let c = 0; c < gs; c++) {
      const idx     = r * gs + c
      const tileNum = state.board[idx]
      const focused =
        !state.isSolved &&
        state.movableIndices.length > 0 &&
        idx === state.movableIndices[state.focusIndex]

      const cellX = OUTER_PAD + c * cellW
      const cellY = OUTER_PAD + r * cellH

      // Selection outline around focused tile
      if (focused && tileNum !== 0) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(cellX + 2, cellY + 2, cellW - 4, cellH - 4, 6)
        ctx.stroke()
      }

      // Tile number
      if (tileNum !== 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fillText(String(tileNum), cellX + cellW / 2, cellY + cellH / 2)
      }
    }
  }

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}

// ─── Text content builders ─────────────────────────────────────────────────
function buildTitleText(): string {
  const items = TITLE_MENU_ITEMS.map((label, i) =>
    i === state.titleMenuIndex ? `[${label}]` : ` ${label} `
  )
  return `Sliding Puzzle\n\nMode\n${items.join('\n')}`
}

function buildGameLeftText(): string {
  const gs = state.gridSize
  const statusStr = state.isSolved ? 'Solved!' : `Moves: ${state.moves}`
  return `${gs}x${gs} Puzzle\n${statusStr}`
}

function buildGameMenuText(): string {
  const items = GAME_MENU_ITEMS.map((label, i) =>
    i === state.gameMenuIndex ? `[${label}]` : ` ${label} `
  )
  return `Game Menu\n\n${items.join('\n')}`
}

// ─── Container builders ────────────────────────────────────────────────────
const EVT_CONTAINER = new TextContainerProperty({
  containerID: 1, containerName: 'evt',
  content: ' ',
  xPosition: 0, yPosition: 0,
  width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT,
  isEventCapture: 1, paddingLength: 0,
})

// Hint bar: displayed at the very bottom of every screen
function hintContainer(content: string): TextContainerProperty {
  return new TextContainerProperty({
    containerID: 12, containerName: 'hint',
    content,
    xPosition: 20, yPosition: 230,
    width: 540, height: 35,
    isEventCapture: 0,
  })
}

function buildTitleContainers() {
  return {
    textObject: [
      EVT_CONTAINER,
      new TextContainerProperty({
        containerID: 11, containerName: 'main',
        content: buildTitleText(),
        xPosition: 20, yPosition: 25,
        width: 280, height: 210,
        isEventCapture: 0,
      }),
      hintContainer('Select: Up, Down      Start: Click'),
    ],
    imageObject: [] as ImageContainerProperty[],
    containerTotalNum: 3,
  }
}

function buildGameMenuContainers() {
  return {
    textObject: [
      EVT_CONTAINER,
      new TextContainerProperty({
        containerID: 11, containerName: 'main',
        content: buildGameMenuText(),
        xPosition: 20, yPosition: 25,
        width: 280, height: 210,
        isEventCapture: 0,
      }),
      hintContainer('Select: Up, Down      Choose: Click'),
    ],
    imageObject: [] as ImageContainerProperty[],
    containerTotalNum: 3,
  }
}

function buildGameContainers() {
  return {
    textObject: [
      EVT_CONTAINER,
      new TextContainerProperty({
        containerID: 11, containerName: 'left',
        content: buildGameLeftText(),
        xPosition: 20, yPosition: 25,
        width: 240, height: 200,
        isEventCapture: 0,
      }),
      hintContainer('Swipe: Up, Down      Move: Click      Menu: Dbl'),
    ],
    imageObject: [
      new ImageContainerProperty({
        containerID: 13, containerName: 'grid',
        xPosition: 230, yPosition: 25,
        width: IMG_W, height: IMG_H,
      }),
    ],
    containerTotalNum: 4,
  }
}

function buildContainers(screen: Screen) {
  switch (screen) {
    case 'title':     return buildTitleContainers()
    case 'game_menu': return buildGameMenuContainers()
    case 'game':      return buildGameContainers()
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────
let pageSetUp = false
let pushInFlight = false
let renderedScreen: Screen | null = null

async function sendGridImage(): Promise<void> {
  if (!bridge) return
  await bridge.updateImageRawData(new ImageRawDataUpdate({
    containerID: 13,
    containerName: 'grid',
    imageData: renderGridToPngBase64(),
  }))
}

async function setupMainPage(): Promise<void> {
  if (!bridge) return
  const c = buildTitleContainers()
  await bridge.createStartUpPageContainer(
    new CreateStartUpPageContainer({
      containerTotalNum: c.containerTotalNum,
      textObject: c.textObject,
    })
  )
  pageSetUp = true
  renderedScreen = 'title'
}

export async function pushFrame(): Promise<void> {
  if (!bridge || !pageSetUp) return
  if (pushInFlight) return
  pushInFlight = true

  try {
    const screen = state.screen
    const needsRebuild = screen !== renderedScreen

    if (needsRebuild) {
      // Full container rebuild for screen transitions
      const c = buildContainers(screen)
      await bridge.rebuildPageContainer(new RebuildPageContainer({
        containerTotalNum: c.containerTotalNum,
        textObject: c.textObject,
        imageObject: c.imageObject.length > 0 ? c.imageObject : undefined,
      }))
      renderedScreen = screen

      // Image data must be sent AFTER the rebuild
      if (screen === 'game') await sendGridImage()

    } else {
      // Same screen: partial updates only
      const updateText = async (id: number, name: string, content: string) => {
        await bridge!.textContainerUpgrade(new TextContainerUpgrade({
          containerID: id, containerName: name,
          contentOffset: 0, contentLength: 2000, content,
        }))
      }

      switch (screen) {
        case 'title':
          await updateText(11, 'main', buildTitleText())
          await updateText(12, 'hint', 'Select: Up, Down      Start: Click')
          break
        case 'game_menu':
          await updateText(11, 'main', buildGameMenuText())
          await updateText(12, 'hint', 'Select: Up, Down      Choose: Click')
          break
        case 'game':
          await updateText(11, 'left', buildGameLeftText())
          await updateText(12, 'hint', 'Swipe: Up, Down      Move: Click      Menu: Dbl')
          await sendGridImage()
          break
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
  appendEventLog('Puzzle: display initialized')
}
