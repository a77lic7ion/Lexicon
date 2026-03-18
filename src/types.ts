import { LetterTile } from './constants';

export type GamePhase = 'setup' | 'battle' | 'gameover';
export type WinMode = 'classic' | 'lexicon' | 'hybrid';

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
}

export interface PlayerState {
  id: 1 | 2;
  name: string;
  grid: CellState[][];
  bank: LetterTile[];
  tilesPlaced: number;
  isReady: boolean;
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
  winner: 1 | 2 | null;
  turnCount: number;
}
