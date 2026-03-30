import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

// ─── Screen types ──────────────────────────────────────────────────────────
export type Screen = 'title' | 'game' | 'game_menu'

// ─── Grid size options ─────────────────────────────────────────────────────
export const GRID_SIZES = [3, 4] as const
export type GridSize = (typeof GRID_SIZES)[number]

// Number of random shuffle moves per grid size
const SHUFFLE_MOVES: Record<GridSize, number> = { 3: 300, 4: 1000 }

// ─── Menu items ────────────────────────────────────────────────────────────
export const TITLE_MENU_ITEMS = ['3x3', '4x4'] as const
export const GAME_MENU_ITEMS  = ['Back', 'Reset', 'Title'] as const

// ─── Shared app state ─────────────────────────────────────────────────────
export const state = {
  // Navigation
  screen: 'title' as Screen,

  // Title screen
  titleMenuIndex: 0,  // index into TITLE_MENU_ITEMS

  // Game menu
  gameMenuIndex: 0,   // index into GAME_MENU_ITEMS

  // Game
  gridSize: 3 as GridSize,
  board: [] as number[],
  blankIndex: -1,
  movableIndices: [] as number[],
  focusIndex: 0,
  moves: 0,
  isSolved: false,
}

export let bridge: EvenAppBridge | null = null
export function setBridge(b: EvenAppBridge): void { bridge = b }

// ─── Helpers ───────────────────────────────────────────────────────────────
export function totalTiles(): number { return state.gridSize * state.gridSize }

// ─── Board logic ───────────────────────────────────────────────────────────
export function checkSolved(): boolean {
  const total = totalTiles()
  for (let i = 0; i < total - 1; i++) {
    if (state.board[i] !== i + 1) return false
  }
  return true
}

export function updateMovableIndices(): void {
  const gs = state.gridSize
  const movables: number[] = []
  const bRow = Math.floor(state.blankIndex / gs)
  const bCol = state.blankIndex % gs
  if (bRow > 0)      movables.push(state.blankIndex - gs)
  if (bCol < gs - 1) movables.push(state.blankIndex + 1)
  if (bRow < gs - 1) movables.push(state.blankIndex + gs)
  if (bCol > 0)      movables.push(state.blankIndex - 1)
  state.movableIndices = movables.sort((a, b) => a - b)
  if (state.focusIndex >= state.movableIndices.length) state.focusIndex = 0
}

export function moveFocusedTile(): void {
  if (state.isSolved || state.movableIndices.length === 0) return
  const tileIndex = state.movableIndices[state.focusIndex]
  state.board[state.blankIndex] = state.board[tileIndex]
  state.board[tileIndex] = 0
  state.blankIndex = tileIndex
  state.moves += 1
  state.isSolved = checkSolved()
  updateMovableIndices()
}

export function cycleFocusForward(): void {
  if (state.isSolved || state.movableIndices.length === 0) return
  state.focusIndex = (state.focusIndex + 1) % state.movableIndices.length
}

export function cycleFocusBackward(): void {
  if (state.isSolved || state.movableIndices.length === 0) return
  state.focusIndex =
    (state.focusIndex - 1 + state.movableIndices.length) % state.movableIndices.length
}

export function initBoard(gs?: GridSize): void {
  if (gs !== undefined) state.gridSize = gs
  const total = totalTiles()

  // Build solved board [1, 2, …, n-1, 0]
  state.board = []
  for (let i = 1; i < total; i++) state.board.push(i)
  state.board.push(0)
  state.blankIndex = total - 1
  updateMovableIndices()

  // Shuffle via random valid moves (guarantees solvability)
  let shuffles = SHUFFLE_MOVES[state.gridSize]
  let prevBlank = -1
  while (shuffles > 0) {
    const candidates = state.movableIndices.filter(i => i !== prevBlank)
    const pool = candidates.length > 0 ? candidates : state.movableIndices
    const tileIdx = pool[Math.floor(Math.random() * pool.length)]
    state.board[state.blankIndex] = state.board[tileIdx]
    state.board[tileIdx] = 0
    prevBlank = state.blankIndex
    state.blankIndex = tileIdx
    updateMovableIndices()
    shuffles--
  }

  state.moves = 0
  state.isSolved = false
  state.focusIndex = 0
  updateMovableIndices()
}

// ─── Title menu navigation ─────────────────────────────────────────────────
export function cycleTitleMenuForward(): void {
  state.titleMenuIndex = (state.titleMenuIndex + 1) % TITLE_MENU_ITEMS.length
}
export function cycleTitleMenuBackward(): void {
  state.titleMenuIndex =
    (state.titleMenuIndex - 1 + TITLE_MENU_ITEMS.length) % TITLE_MENU_ITEMS.length
}
export function startGame(): void {
  const gs = GRID_SIZES[state.titleMenuIndex]
  initBoard(gs)
  state.screen = 'game'
}

// ─── Game menu navigation ──────────────────────────────────────────────────
export function cycleGameMenuForward(): void {
  state.gameMenuIndex = (state.gameMenuIndex + 1) % GAME_MENU_ITEMS.length
}
export function cycleGameMenuBackward(): void {
  state.gameMenuIndex =
    (state.gameMenuIndex - 1 + GAME_MENU_ITEMS.length) % GAME_MENU_ITEMS.length
}
export function executeGameMenu(): void {
  switch (state.gameMenuIndex) {
    case 0: // Back — resume the current game
      state.screen = 'game'
      break
    case 1: // Reset — restart with same grid size
      initBoard(state.gridSize)
      state.screen = 'game'
      break
    case 2: // Title — return to mode-select screen
      state.screen = 'title'
      state.titleMenuIndex = 0
      break
  }
}
