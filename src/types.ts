import type { LetterTile } from './constants';
export type { LetterTile };

export type GamePhase = 'setup' | 'battle' | 'gameover';
export type WinMode = 'classic' | 'lexicon' | 'hybrid';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CellState {
  row: number;
  col: number;
  tileId: string | null;
  letter: string | null;
  tier: string | null;
  isHit: boolean;
  isMiss: boolean;
  isSpecial?: 'vault' | 'poison' | 'mirror' | 'charged';
  hitsRequired?: number;
  hitsReceived?: number;
  isRevealed?: boolean; // For Spark/Surge
  isMirrored?: boolean; // For Mirror asset
  isHarvested?: boolean; // For Mirror asset single-use harvest
}

export interface PlayerState {
  id: 1 | 2;
  name: string;
  grid: CellState[][];
  bank: LetterTile[];
  tilesPlaced: number;
  isReady: boolean;
  score: number;
  bombsPlayed: number;
  tilesDestroyed: number;
  totalHits: number;
  isAI?: boolean;
  difficulty?: Difficulty;
  placementHistory?: { row: number; col: number; tileId: string; size: number; orientation: 'h' | 'v' }[];
}

export interface HistoryEvent {
  id: string;
  turn: number;
  playerId: 1 | 2;
  playerName: string;
  type: 'fire' | 'bomb';
  action: string;
  result: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  winMode: WinMode;
  activePlayer: 1 | 2;
  players: {
    1: PlayerState;
    2: PlayerState;
  };
  playedWords: string[];
  history: HistoryEvent[];
  winner: 1 | 2 | null;
  turnCount: number;
  lastAction?: {
    type: 'fire' | 'bomb';
    cells: { r: number; c: number }[];
    playerId: 1 | 2;
  };
}

export interface Toast {
  id: string;
  type: 'harvest' | 'miss' | 'hit' | 'poison' | 'damaged' | 'info';
  message: string;
  duration: number;
}
